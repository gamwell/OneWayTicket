import { useState } from 'react'
import { supabase } from '../lib/supabaseClient' // Votre instance supabase

export default function DocumentUpload({ userId }) {
  const [uploading, setUploading] = useState(false)

  const uploadDocument = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner un fichier.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Upload du fichier vers le bucket "justificatifs"
      let { error: uploadError } = await supabase.storage
        .from('justificatifs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Mise à jour de la table profiles pour indiquer que le doc est reçu
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          document_url: filePath,
          status_verification: 'en_attente' 
        })
        .eq('id', userId)

      if (updateError) throw updateError

      alert('Document envoyé avec succès ! Notre équipe va le valider.')
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Justificatif France Travail</h3>
      <p className="text-sm text-gray-600 mb-4">
        Format accepté : PDF, JPG ou PNG (Max 5Mo)
      </p>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={uploadDocument}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="mt-2 text-blue-500">Téléchargement en cours...</p>}
    </div>
  )
}