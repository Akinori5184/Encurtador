import React, { useState } from 'react'

export default function UrlForm(){
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const api = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const submit = async (e:any) => {
    e.preventDefault()
    setLoading(true)
    setShortUrl('')
    try{
      const res = await fetch(`${api}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl })
      })
      const data = await res.json()
      if (res.ok) setShortUrl(data.shortUrl)
      else alert(data.error || 'Error')
    }catch(err){
      console.error(err)
      alert('request failed')
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">URL longa</label>
        <input value={longUrl} onChange={e=>setLongUrl(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="https://exemplo.com/minha-pagina" />
      </div>
      <div>
        <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading?'Encurtando...':'Encurtar'}</button>
      </div>
      {shortUrl && (
        <div>
          <p className="text-sm">Short URL:</p>
          <a className="text-blue-600" href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
        </div>
      )}
    </form>
  )
}
