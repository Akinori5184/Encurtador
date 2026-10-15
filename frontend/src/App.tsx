import React from 'react'
import UrlForm from './components/UrlForm'

export default function App(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Encurtador</h1>
        <UrlForm />
      </div>
    </div>
  )
}
