# 🚀 INSTRUCCIONES DE INSTALACIÓN — Quiniela Mundial 2026

## PASO 1 — Crear las tablas en Supabase

1. Ve a: https://supabase.com/dashboard/project/flawyripybuhifswlipm
2. Haz clic en **"SQL Editor"** en el menú izquierdo (icono de base de datos)
3. Haz clic en **"New query"**
4. Abre el archivo `supabase-schema.sql` de esta carpeta, copia TODO su contenido y pégalo en el editor
5. Haz clic en **"Run"** (botón verde)
6. Debería decir "Success" en verde ✅

---

## PASO 2 — Instalar dependencias del proyecto

1. Abre el CMD (tecla Windows → escribe cmd → Enter)
2. Escribe estos comandos uno a uno:

```
cd C:\Users\juan\Desktop
```
(o donde hayas guardado la carpeta del proyecto)

```
cd quiniela-mundial-2026
npm install
```

Esperamos ~1 minuto a que descargue todo.

---

## PASO 3 — Probar en local

```
npm run dev
```

Abre el navegador en: **http://localhost:5173**

¡Debería funcionar! Crea un grupo y pruébalo.

---

## PASO 4 — Subir a Vercel (para que sea pública)

1. Ve a **github.com** y crea un repositorio nuevo llamado `quiniela-mundial-2026` (público o privado)
2. En el CMD, dentro de la carpeta del proyecto:

```
git init
git add .
git commit -m "Quiniela Mundial 2026"
git remote add origin https://github.com/TU_USUARIO/quiniela-mundial-2026.git
git push -u origin main
```

3. Ve a **vercel.com** → "Add New Project" → importa el repositorio de GitHub
4. En **"Environment Variables"** añade:
   - `VITE_SUPABASE_URL` = `https://flawyripybuhifswlipm.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (la anon key larga)
5. Haz clic en **"Deploy"**

En 2 minutos tendrás una URL pública tipo: `https://quiniela-mundial-2026.vercel.app` 🎉

---

## SISTEMA DE PUNTOS

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej: 2-1 y aciertas 2-1) | ⭐ 3 pts |
| Resultado correcto (ej: aciertas que gana pero no el marcador) | ✓ 1 pt |
| Campeón del mundo acertado | 🏆 10 pts bonus |
| Fallo total | 0 pts |

**Puntuación máxima posible:**
- 88 partidos × 3 pts = 264 pts
- +10 pts bonus campeón
- **Total: 274 pts**

---

## CÓMO FUNCIONA PARA TUS AMIGOS

1. Tú creas el grupo → te da un **código de 6 letras** y un **enlace**
2. Compartes el enlace por WhatsApp
3. Ellos entran, eligen su nombre, avatar y color
4. Todos predicen sus marcadores antes de cada partido
5. Tú metes el resultado real cuando termina → los puntos se actualizan solos en tiempo real
6. En la fase eliminatoria, tú vas actualizando los equipos que pasan
7. En la final, todos predicen el campeón (10 pts bonus)
