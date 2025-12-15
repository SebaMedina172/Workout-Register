"use client"

import React from "react"

/**
 * IndexedDB utilities para cachear datos offline
 */

const DB_NAME = "workout-register"
const DB_VERSION = 1

interface CacheStore {
  name: string
  keyPath: string
}

const STORES: CacheStore[] = [
  { name: "workouts", keyPath: "id" },
  { name: "exercises", keyPath: "id" },
  { name: "stats", keyPath: "id" },
  { name: "templates", keyPath: "id" },
  { name: "userColumns", keyPath: "id" },
]

let db: IDBDatabase | null = null

/**
 * Inicializa la base de datos IndexedDB
 */
export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Crear stores si no existen
      STORES.forEach((store) => {
        if (!database.objectStoreNames.contains(store.name)) {
          database.createObjectStore(store.name, { keyPath: store.keyPath })
        }
      })
    }
  })
}

/**
 * Guarda datos en una store específica
 */
export async function setCacheData(
  storeName: string,
  data: any,
  key?: string,
): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)

    // Si es un array, hacer merge inteligente (no borrar datos existentes)
    if (Array.isArray(data)) {
      //console.log(`💾 Caching ${data.length} items to store "${storeName}" (smart merge)`)
      
      // Obtener todos los items existentes
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        const existingItems = getAllRequest.result || []
        const existingMap = new Map(existingItems.map((item: any) => [item.id, item]))
        
        // Mergear: datos nuevos + datos viejos que tengan ejercicios
        data.forEach((newItem: any) => {
          const existing = existingMap.get(newItem.id)
          // Si el item existente tiene ejercicios, preservarlos
          const merged = existing?.exercises && existing.exercises.length > 0
            ? { ...newItem, exercises: existing.exercises }
            : newItem
          store.put(merged)
          // console.log(`  ↪ ${existing?.exercises?.length ? '✅ Preserved' : '➕ Added'} item:`, { 
          //   id: merged.id, 
          //   type: merged.type, 
          //   exerciseCount: merged.exercises?.length || 0 
          // })
        })
        
        // Limpiar items que ya no están en la API (opcional, puede comentarse si prefieres)
        existingItems.forEach((item: any) => {
          if (!data.find((d: any) => d.id === item.id)) {
            store.delete(item.id)
            //console.log(`  ↪ 🗑️ Removed obsolete item:`, item.id)
          }
        })
      }
    } else {
      //console.log(`💾 Caching single item to store "${storeName}":`, { id: data.id, type: data.type, exerciseCount: data.exercises?.length })
      store.put(data)
    }

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

/**
 * Obtiene datos de una store específica
 */
export async function getCacheData(storeName: string, key?: string): Promise<any> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)

    if (key) {
      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        //console.log(`📖 Retrieved from cache "${storeName}" by key "${key}":`, { id: request.result?.id, type: request.result?.type })
        resolve(request.result)
      }
    } else {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const results = request.result || []
        //console.log(`📖 Retrieved ${results.length} items from cache "${storeName}":`, results.map((r: any) => ({ id: r.id, type: r.type })))
        resolve(results)
      }
    }
  })
}

/**
 * Limpia una store específica
 */
export async function clearCacheStore(storeName: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Limpia toda la base de datos
 */
export async function clearAllCache(): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORES.map((s) => s.name),
      "readwrite",
    )

    STORES.forEach((store) => {
      transaction.objectStore(store.name).clear()
    })

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

/**
 * Detecta si el usuario está online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}

/**
 * Hook para escuchar cambios de conexión
 */
export function useOnlineStatus(): boolean {
  const [isOnlineStatus, setIsOnlineStatus] = React.useState(isOnline())

  React.useEffect(() => {
    const handleOnline = () => setIsOnlineStatus(true)
    const handleOffline = () => setIsOnlineStatus(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnlineStatus
}
