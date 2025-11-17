// // Import necessary modules
// import express from 'express'
// import cors from 'cors'
// import { v4 as uuid } from 'uuid'
// import { uploader } from './middlewares/uploader.js'
// import fs from 'fs' // NEW
// // exec - Needed to execute command in shell
// import { exec } from 'child_process' // NEW
// import path from 'path' // NEW

// // Set up port, defaulting to 2000 if not specified in environment
// const port = process.env.PORT || 2000

// // Initialize Express application
// const app = express()

// // Enable CORS for all routes
// app.use(cors())

// // Parse JSON and URL-encoded bodies
// app.use(express.json())
// app.use(express.urlencoded({ extended: false }))

// // Serve HLS output files statically (NEW)
// app.use('/hls-output', express.static(path.join(process.cwd(), 'hls-output'))) 

// // Define route for video upload
// app.post('/api/uploads', uploader('video'), (req, res) => {
//     // Check if a file was uploaded
//     if (!req.file) {
//         return res.status(400).send('Video not sent!')
//     }

//     // Generate a unique ID for the video
//     const videoID = uuid()
//     const uploadedVideoPath = req.file.path

//     // Define output folder structure (NEW)
//     const outputFolderRootPath = `./hls-output/${videoID}`
//     const outputFolderSubDirectoryPath = {
//         '360p': `${outputFolderRootPath}/360p`,
//         '480p': `${outputFolderRootPath}/480p`,
//         '720p': `${outputFolderRootPath}/720p`,
//         '1080p': `${outputFolderRootPath}/1080p`,
//     }

//     // Create directories if they don't exist, for storing output video (NEW)
//     if (!fs.existsSync(outputFolderRootPath)) {
//         // ./hls-output/video-id/360p/
//         fs.mkdirSync(outputFolderSubDirectoryPath['360p'], { recursive: true })
//         // ./hls-output/video-id/480p/
//         fs.mkdirSync(outputFolderSubDirectoryPath['480p'], { recursive: true }) 
//         // ./hls-output/video-id/720p/
//         fs.mkdirSync(outputFolderSubDirectoryPath['720p'], { recursive: true }) 
//         // ./hls-output/video-id/1080p/
//         fs.mkdirSync(outputFolderSubDirectoryPath['1080p'], { recursive: true })
//     }
// // original transcode 
//     // Define FFmpeg commands for different resolutions (NEW)
//     const ffmpegCommands = [
//         // 360p resolution
//         `ffmpeg -i ${uploadedVideoPath} -vf "scale=w=640:h=360" -c:v libx264 -b:v 800k -c:a aac -b:a 96k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['360p']}/segment%03d.ts" -start_number 0 "${outputFolderSubDirectoryPath['360p']}/index.m3u8"`,
//         // 480p resolution
//         `ffmpeg -i ${uploadedVideoPath} -vf "scale=w=854:h=480" -c:v libx264 -b:v 1400k -c:a aac -b:a 128k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['480p']}/segment%03d.ts" -start_number 0 "${outputFolderSubDirectoryPath['480p']}/index.m3u8"`,
//         // 720p resolution
//         `ffmpeg -i ${uploadedVideoPath} -vf "scale=w=1280:h=720" -c:v libx264 -b:v 2800k -c:a aac -b:a 128k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['720p']}/segment%03d.ts" -start_number 0 "${outputFolderSubDirectoryPath['720p']}/index.m3u8"`,
//         // 1080p resolution
//         `ffmpeg -i ${uploadedVideoPath} -vf "scale=w=1920:h=1080" -c:v libx264 -b:v 5000k -c:a aac -b:a 192k -f hls -hls_time 15 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['1080p']}/segment%03d.ts" -start_number 0 "${outputFolderSubDirectoryPath['1080p']}/index.m3u8"`,
//     ]



















//     // Function to execute a single FFmpeg command (NEW)
//     const executeCommand = (command)=> {
//         return new Promise((resolve, reject) => {
//             // Execute ffmpeg command in shell
//             exec(command, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`exec error: ${error}`)
//                     reject(error)
//                 } else {
//                     resolve()
//                 }
//             })
//         })
//     }

//     // Execute all FFmpeg commands concurrently (NEW)
//     Promise.all(ffmpegCommands.map((cmd) => executeCommand(cmd)))
//         .then(() => {
//             // Create master playlist
//             const masterPlaylistPath = `${outputFolderRootPath}/index.m3u8` // ./hls-output/video-id/index.m3u8
//             const masterPlaylistContent = `
//                 #EXTM3U
//                 #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
//                 360p/index.m3u8
//                 #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
//                 480p/index.m3u8
//                 #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
//                 720p/index.m3u8
//                 #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
//                 1080p/index.m3u8
//             `.trim() 

//             fs.writeFileSync(masterPlaylistPath, masterPlaylistContent) // write the above content in the index.m3u8 file

//             // Creating URLs for accessing the video streams
//             const videoUrls = {
//                 master: `http://localhost:${port}/hls-output/${videoID}/index.m3u8`,
//                 // '360p': `http://localhost:${port}/hls-output/${videoID}/360p/index.m3u8`,
//                 // '480p': `http://localhost:${port}/hls-output/${videoID}/480p/index.m3u8`,
//                 // '720p': `http://localhost:${port}/hls-output/${videoID}/720p/index.m3u8`,
//                 // '1080p': `http://localhost:${port}/hls-output/${videoID}/1080p/index.m3u8`,
//             }

//             // Send success response with video URLs
//             return res.status(200).json({ videoId, videoUrls })
//         })
//         .catch((error) => {
//             console.error(`HLS conversion error: ${error}`)

//             // Clean up: Delete the uploaded video file
//             try {
//                 fs.unlinkSync(uploadedVideoPath)
//             } catch (err) {
//                 console.error(`Failed to delete original video file: ${err}`)
//             }

//             // Clean up: Delete the generated HLS files and folders
//             try {
//                 fs.unlinkSync(outputFolderRootPath)
//             } catch (err) {
//                 console.error(`Failed to delete generated HLS files: ${err}`)
//             }

//             // Send error response
//             return res.status(500).send('HLS conversion failed!')
//         })
// })

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running at ${port}`)
// })






import express from 'express'
import cors from 'cors'
import { v4 as uuid } from 'uuid'
import { uploader } from './middlewares/uploader.js'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'

const port = process.env.PORT || 2000
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/hls-output', express.static(path.join(process.cwd(), 'hls-output')))

app.post('/api/uploads', uploader('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('Video not sent!')

  const videoID = uuid()

  // FIX: Windows backslash bug
  const uploadedVideoPath = req.file.path.replace(/\\/g, "/")

  const outputFolderRootPath = `./hls-output/${videoID}`
  const outputFolderSubDirectoryPath = {
    '360p': `${outputFolderRootPath}/360p`,
    '480p': `${outputFolderRootPath}/480p`,
    '720p': `${outputFolderRootPath}/720p`,
    '1080p': `${outputFolderRootPath}/1080p`,
  }

  // Always create directories
  Object.values(outputFolderSubDirectoryPath).forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true })
  })

  // HLS transcoding commands
const ffmpegCommands = [
  // 360p
  `ffmpeg -y -i "${uploadedVideoPath}" -vf "scale=640:360:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2,setsar=1" -metadata:s:v rotate=0 -c:v libx264 -preset veryfast -crf 32 -maxrate 600k -bufsize 900k -c:a aac -b:a 64k -ac 1 -ar 44100 -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['360p']}/segment%03d.ts" "${outputFolderSubDirectoryPath['360p']}/index.m3u8"`,

  // 480p
  `ffmpeg -y -i "${uploadedVideoPath}" -vf "scale=854:480:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2,setsar=1" -metadata:s:v rotate=0 -c:v libx264 -preset fast -crf 28 -maxrate 1200k -bufsize 1800k -c:a aac -b:a 96k -ac 2 -ar 44100 -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['480p']}/segment%03d.ts" "${outputFolderSubDirectoryPath['480p']}/index.m3u8"`,

  // 720p
  `ffmpeg -y -i "${uploadedVideoPath}" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2,setsar=1" -metadata:s:v rotate=0 -c:v libx264 -preset medium -crf 23 -maxrate 2800k -bufsize 4200k -c:a aac -b:a 128k -ac 2 -ar 48000 -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['720p']}/segment%03d.ts" "${outputFolderSubDirectoryPath['720p']}/index.m3u8"`,

  // 1080p
  `ffmpeg -y -i "${uploadedVideoPath}" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2,setsar=1" -metadata:s:v rotate=0 -c:v libx264 -preset slow -crf 20 -maxrate 5000k -bufsize 7500k -c:a aac -b:a 192k -ac 2 -ar 48000 -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${outputFolderSubDirectoryPath['1080p']}/segment%03d.ts" "${outputFolderSubDirectoryPath['1080p']}/index.m3u8"`
]

  // FIX: Execute FFmpeg sequentially for stability
  const execCommand = (cmd) => new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("FFmpeg Error:", stderr)
        return reject(err)
      }
      resolve()
    })
  })

  try {
    for (const command of ffmpegCommands) {
      await execCommand(command)  // Run one by one
    }

    // Create master playlist
    const masterPlaylistContent = `
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8
`.trim()

    fs.writeFileSync(`${outputFolderRootPath}/index.m3u8`, masterPlaylistContent)

    return res.status(200).json({
      videoID,
      videoUrls: {
        master: `http://localhost:${port}/hls-output/${videoID}/index.m3u8`
      }
    })

  } catch (error) {
    console.error("HLS conversion failed:", error)

    try { fs.unlinkSync(uploadedVideoPath) } catch {}
    try { fs.rmSync(outputFolderRootPath, { recursive: true, force: true }) } catch {}

    return res.status(500).send("HLS conversion failed!")
  }
})

app.listen(port, () => console.log(`🚀 Server running on port ${port}`))
