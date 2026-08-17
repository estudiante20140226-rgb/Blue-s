require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('⚠️  Falta SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET en tu archivo .env');
}

// Cacheamos el token para no pedir uno nuevo en cada request
let cachedToken = null;
let tokenExpiresAt = 0;

async function getSpotifyToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  console.log('🔑 Pidiendo token con Client ID:', CLIENT_ID ? CLIENT_ID.slice(0, 4) + '...' + CLIENT_ID.slice(-4) : 'UNDEFINED');
  console.log('🔑 Client ID longitud:', CLIENT_ID ? CLIENT_ID.length : 0, '| Client Secret longitud:', CLIENT_SECRET ? CLIENT_SECRET.length : 0);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errText = await response.text();
    console.log('❌ Error pidiendo token:', response.status, errText);
    throw new Error(`Error pidiendo token a Spotify: ${errText}`);
  }

  const data = await response.json();
  console.log('✅ Token conseguido correctamente, expira en', data.expires_in, 'segundos');
  cachedToken = data.access_token;
  // Restamos 60s de margen antes de que expire
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

// GET /api/track-info?ids=id1,id2,id3
// Devuelve título, artista, álbum, portada y duración de cada track
app.get('/api/track-info', async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (!idsParam) {
      return res.status(400).json({ error: 'Falta el parámetro ids' });
    }

    // Nota: Spotify quitó "Get Several Tracks" (GET /tracks) para apps nuevas
    // desde feb-2026, así que pedimos cada canción con "Get Track" (GET /tracks/{id})
    const ids = idsParam.split(',').filter(Boolean).slice(0, 50);
    const token = await getSpotifyToken();

    const trackPromises = ids.map(async (id) => {
      try {
        const r = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!r.ok) {
          console.log(`❌ Error consultando track ${id}:`, r.status);
          return null;
        }
        const t = await r.json();
        return {
          id: t.id,
          title: t.name,
          artist: t.artists.map(a => a.name).join(', '),
          album: t.album.name,
          art: t.album.images?.[2]?.url || t.album.images?.[0]?.url || '',
          duration_ms: t.duration_ms
        };
      } catch (e) {
        console.log(`❌ Excepción consultando track ${id}:`, e.message);
        return null;
      }
    });

    const tracks = await Promise.all(trackPromises);

    res.json({ tracks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error consultando Spotify' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));