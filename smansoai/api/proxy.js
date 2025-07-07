// api/proxy.js

// Handler default untuk Vercel Serverless Function
export default async function handler(request, response) {
  // Hanya izinkan metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Ambil API key rahasia dari Environment Variables di Vercel
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: { message: 'API key tidak dikonfigurasi di server.' } });
  }

  try {
    // Teruskan (forward) request body dari frontend ke OpenRouter
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Tambahkan API key di sini, di sisi server yang aman
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request.body), // request.body berisi payload dari frontend
    });

    // Ambil data JSON dari respons OpenRouter
    const data = await openRouterResponse.json();

    // Jika ada error dari OpenRouter, teruskan juga
    if (!openRouterResponse.ok) {
        console.error('Error dari OpenRouter:', data);
        return response.status(openRouterResponse.status).json(data);
    }
    
    // Kirimkan kembali respons sukses dari OpenRouter ke frontend
    return response.status(200).json(data);

  } catch (error) {
    console.error('Error di proxy function:', error);
    return response.status(500).json({ error: { message: 'Terjadi kesalahan internal pada server.' } });
  }
}
