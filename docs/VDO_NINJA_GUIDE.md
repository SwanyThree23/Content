# 🎥 VDO.ninja Live Recording Integration Guide

## **Overview**

The AI Soap Opera Studio now supports **live actor recordings** using VDO.ninja as an alternative or complement to AI-generated videos!

### **What is VDO.ninja?**

VDO.ninja is a **free, peer-to-peer video streaming platform** that allows you to:
- Record live actors remotely
- Use multi-camera setups
- Stream directly from browsers (no downloads)
- Create professional quality recordings
- Collaborate with actors anywhere in the world

### **Why Use Live Recording?**

- **Human Authenticity**: Real actors bring genuine emotion
- **Cost-Effective**: No AI video generation costs
- **Instant Results**: Record and use immediately
- **Creative Control**: Direct your scenes in real-time
- **Hybrid Approach**: Mix AI scripts with live performances

---

## **🚀 Quick Start**

### **1. Access Live Recording Studio**

```
Navigate to: http://localhost:3000/studio/live-recording
```

Or click **"Live Recording"** button in the Studio header.

### **2. Setup Recording Session**

1. **Select Episode**: Enter your episode ID
2. **Choose Scene**: Set the scene number
3. **Add Actors**: Enter actor names and characters
4. **Create Room**: Click "Create Recording Room"

### **3. Share URLs with Actors**

You'll receive unique URLs for:
- **Director URL**: Control room (for you)
- **Actor URLs**: One for each actor
- **View URL**: Monitor all streams

### **4. Start Recording**

1. Open Director URL in your browser
2. Actors open their URLs
3. All enable cameras/microphones
4. Click "Record" in Director interface
5. Record your scene!
6. Stop recording and download

---

## **📋 Complete Workflow**

### **Preparation Phase**

1. **Generate Script with Claude AI**
   ```bash
   # Use the studio to generate episode script
   POST /api/episodes/generate
   ```

2. **Review Scenes**
   - Read generated dialogue
   - Note camera angles
   - Plan shots

3. **Cast Actors**
   - Assign actors to characters
   - Share script/dialogue
   - Schedule recording time

### **Recording Phase**

1. **Create Recording Room**
   - Go to Live Recording page
   - Enter episode and scene details
   - Add all actors

2. **Setup Check**
   - Director opens Director URL
   - Actors join their URLs
   - Test cameras and audio
   - Check lighting and framing

3. **Record Scene**
   - Director gives direction
   - Actors perform dialogue
   - Record multiple takes if needed
   - Monitor quality in real-time

4. **Download Recording**
   - Stop recording
   - Download video file
   - Save to your computer

### **Post-Production Phase**

1. **Upload Recording**
   - Upload to cloud storage
   - Link to episode in database

2. **Edit (Optional)**
   - Use CapCut or editing software
   - Add transitions, effects
   - Combine with AI-generated scenes

3. **Publish**
   - Upload to YouTube
   - Add to series playlist
   - Share with audience!

---

## **🎬 Multi-Camera Setup**

### **Example: Two-Actor Scene**

```typescript
// Actors in the scene
actors = [
  { name: "John Smith", character: "Victor Sterling" },
  { name: "Jane Doe", character: "Amanda Hart" }
]

// Generated URLs
Director URL: https://vdo.ninja/?director=DominoDynasty_E1_S2
John's URL: https://vdo.ninja/?push=JohnSmith&room=DominoDynasty_E1_S2
Jane's URL: https://vdo.ninja/?push=JaneDoe&room=DominoDynasty_E1_S2
View URL: https://vdo.ninja/?view=DominoDynasty_E1_S2
```

### **Director Controls**

From the Director URL, you can:
- ✅ See all actor streams
- ✅ Control recording start/stop
- ✅ Adjust audio levels
- ✅ Switch camera views
- ✅ Add effects and filters
- ✅ Monitor connection quality

---

## **💡 Best Practices**

### **Technical Setup**

1. **Internet Connection**
   - Use wired connection if possible
   - Minimum 5 Mbps upload per actor
   - Test connection before recording

2. **Equipment**
   - Good quality webcam (1080p recommended)
   - External microphone for better audio
   - Proper lighting (ring light or natural light)
   - Clean, professional background

3. **Browser**
   - Use Chrome or Edge for best compatibility
   - Close other tabs to save bandwidth
   - Allow camera and microphone permissions

### **Recording Tips**

1. **Preparation**
   - Rehearse dialogue beforehand
   - Do a test recording first
   - Have script visible (off-camera)

2. **During Recording**
   - Maintain eye contact with camera
   - Speak clearly and project voice
   - Stay in frame
   - Minimize background noise

3. **Quality**
   - Use "high" or "ultra" quality preset
   - Record in well-lit environment
   - Check audio levels before starting
   - Record backup takes

### **Collaboration**

1. **Communication**
   - Use Discord/Slack for coordination
   - Have separate audio channel for direction
   - Schedule specific recording times

2. **Direction**
   - Give clear, concise feedback
   - Use Director controls effectively
   - Review takes before moving on

---

## **🔧 Advanced Features**

### **Custom Quality Settings**

```typescript
// Available quality presets
const qualityPresets = {
  low: { videobitrate: 500, audiobitrate: 64 },
  medium: { videobitrate: 1500, audiobitrate: 128 },
  high: { videobitrate: 3000, audiobitrate: 192 },
  ultra: { videobitrate: 6000, audiobitrate: 256 }
};
```

### **OBS Integration**

Use VDO.ninja with OBS for professional recording:

1. Add Browser Source in OBS
2. Use the View URL + `&cleanoutput&autostart`
3. Record directly in OBS
4. Add overlays, transitions, effects

```
OBS Browser Source URL:
https://vdo.ninja/?view=YourRoom&cleanoutput&autostart
```

### **FFmpeg Recording**

Record directly using FFmpeg:

```bash
ffmpeg -f lavfi -i anullsrc -rtsp_transport tcp \
  -i "https://vdo.ninja/?view=YourRoom&cleanoutput" \
  -c:v libx264 -preset veryfast -crf 23 \
  -c:a aac -b:a 128k \
  -t 300 \
  output.mp4
```

---

## **🎭 Use Cases**

### **1. Hybrid Production**

Combine AI and live actors:
- **AI Script**: Claude generates dialogue
- **AI Scenes**: Veo 3 creates establishing shots
- **Live Actors**: Record dramatic dialogue scenes
- **Result**: Best of both worlds!

### **2. Remote Collaboration**

Actors in different locations:
- California actor at home
- New York actor at home
- Director in third location
- All record together in real-time

### **3. Multi-Take Recording**

Record multiple versions:
- Different emotional tones
- Various camera angles
- Alternate dialogue
- Choose best take in post-production

### **4. Live Direction**

Direct scenes in real-time:
- Give feedback between takes
- Adjust performance
- Try different approaches
- Capture authentic reactions

---

## **🔒 Security & Privacy**

### **Room Passwords**

All rooms are password-protected:
- Automatically generated secure passwords
- Only people with URL + password can join
- Change password anytime

### **Peer-to-Peer**

- Direct browser-to-browser connection
- No video stored on servers
- Complete privacy
- End-to-end encrypted

### **Data Retention**

- VDO.ninja doesn't store recordings
- You control all video files
- Download immediately after recording
- Delete from browser when done

---

## **💰 Cost Comparison**

### **VDO.ninja (Live Actors)**

| Item | Cost |
|------|------|
| VDO.ninja Platform | **FREE** |
| Actor Payment | $50-200/episode |
| Equipment (one-time) | $100-500 |
| **Total per Episode** | **$50-200** |

### **Veo 3 (AI Generation)**

| Item | Cost |
|------|------|
| Veo 3 Video Generation | $1-3 per scene |
| 6 scenes/episode | $6-18/episode |
| **Total per Episode** | **$6-18** |

### **Hybrid Approach**

- AI for establishing shots: $3-9
- Live actors for dialogue: $50-100
- **Total**: $53-109/episode
- **Best of both worlds!**

---

## **🎓 Example: Domino Dynasty**

### **Series Setup**

```
Series: Domino Dynasty
Episode: 1
Scene: 2 - "The Confrontation"
Location: Victor's Office
```

### **Cast**

- Victor Sterling - Played by John
- Amanda Hart - Played by Jane

### **Recording Session**

1. **Create Room**
   ```
   Room ID: DominoDynasty_E1_S2
   Password: domino2024
   ```

2. **Distribute URLs**
   - John receives his Actor URL
   - Jane receives her Actor URL
   - Director opens control room

3. **Record Scene**
   - 3-minute dialogue scene
   - 2 takes recorded
   - Best take selected

4. **Result**
   - High-quality video
   - Authentic performances
   - Ready for episode compilation

---

## **📊 Database Integration**

All recording sessions are tracked in the database:

```sql
-- Recording sessions table
SELECT * FROM recording_sessions
WHERE episode_id = 'your-episode-id';

-- Actor streams
SELECT * FROM actor_streams
WHERE recording_session_id = 'session-id';

-- Recording files
SELECT * FROM recording_files
WHERE recording_session_id = 'session-id';
```

---

## **🔄 Workflow Integration**

### **Option 1: Full Live Recording**

1. Generate script with Claude AI
2. Record ALL scenes with live actors
3. Edit and compile episode
4. Upload to YouTube

### **Option 2: Hybrid Approach**

1. Generate script with Claude AI
2. Use Veo 3 for establishing shots
3. Record dialogue scenes with live actors
4. Combine AI and live footage
5. Upload to YouTube

### **Option 3: Selective Live**

1. Generate script with Claude AI
2. Use Veo 3 for most scenes
3. Record key dramatic scenes with actors
4. Mix for maximum impact
5. Upload to YouTube

---

## **🆘 Troubleshooting**

### **Connection Issues**

**Problem**: Actor can't join room
- Check room ID and password
- Verify internet connection
- Try different browser
- Refresh page

**Problem**: Poor video quality
- Reduce quality setting
- Close other applications
- Use wired connection
- Check bandwidth

### **Audio Issues**

**Problem**: No audio
- Check microphone permissions
- Verify correct mic selected
- Increase audio levels
- Test in Director controls

**Problem**: Echo or feedback
- Use headphones
- Mute when not speaking
- Check audio sources

### **Recording Issues**

**Problem**: Can't start recording
- Check Director permissions
- Refresh Director page
- Verify all actors joined
- Check browser compatibility

---

## **🎉 Success Tips**

1. **Start Simple**: One actor, one scene, test everything
2. **Plan Ahead**: Schedule recordings, share scripts
3. **Communicate**: Clear direction, good coordination
4. **Test First**: Always do test recording
5. **Multiple Takes**: Record backup options
6. **Have Fun**: Enjoy the creative process!

---

## **📚 Resources**

- **VDO.ninja Website**: https://vdo.ninja
- **VDO.ninja Documentation**: https://docs.vdo.ninja
- **VDO.ninja Discord**: Community support
- **Studio Documentation**: /docs/SETUP_GUIDE.md

---

## **🚀 Next Steps**

1. Try a test recording with yourself
2. Invite actors to record a scene
3. Experiment with multi-camera
4. Mix AI and live content
5. Create your first hybrid episode!

---

**🎬 Ready to bring your soap opera to life with real actors? Start recording now!**
