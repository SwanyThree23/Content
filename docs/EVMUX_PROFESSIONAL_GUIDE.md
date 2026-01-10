# 📡 evmux + VDO.ninja Professional Broadcasting Guide

## **Complete Production Solution**

This guide covers the **complete professional broadcasting system** combining:
- **VDO.ninja** - Free peer-to-peer actor recording
- **evmux** - Professional RTMP streaming with overlays
- **YouTube/Twitch** - Multi-platform live streaming
- **AI Integration** - Claude scripts + Veo 3 videos

---

## **🎯 Three Production Workflows**

### **Workflow 1: VDO.ninja Only** 💚
**Best for**: Simple recordings, budget-conscious creators

**Process**:
1. Generate script with Claude AI
2. Create VDO.ninja recording room
3. Record scenes with live actors
4. Download videos
5. Edit manually
6. Upload to YouTube

**Pros**:
- ✅ Completely free
- ✅ Multi-camera support
- ✅ High quality recordings
- ✅ Full control over editing

**Cons**:
- ❌ Manual editing required
- ❌ No live streaming
- ❌ No automated overlays

**Cost**: $0 (+ actor fees)

---

### **Workflow 2: evmux Only** 💙
**Best for**: Live streaming events, professional broadcasts

**Process**:
1. Setup RTMP stream
2. Configure web source overlays
3. Add platform destinations (YouTube, Twitch)
4. Start live broadcast
5. Stream directly to platforms

**Pros**:
- ✅ Professional overlays & titles
- ✅ Multi-platform streaming
- ✅ Real-time broadcasting
- ✅ Automated graphics

**Cons**:
- ❌ Requires video source
- ❌ Not for recording/editing
- ❌ Live only (no recording)

**Cost**: evmux pricing + bandwidth

---

### **Workflow 3: Hybrid Production** 💜 ⭐ **RECOMMENDED**
**Best for**: Professional content creators, soap opera studios

**Complete Process**:

#### **Step 1: Pre-Production**
1. Generate episode script with Claude AI
2. Review scenes and dialogue
3. Cast actors for characters
4. Schedule recording session

#### **Step 2: VDO.ninja Recording**
1. Create hybrid workflow in Professional Broadcast Studio
2. VDO.ninja room automatically created
3. Share URLs with actors
4. Record all scenes
5. Download recordings

#### **Step 3: evmux Broadcast Setup**
1. evmux session automatically configured
2. Add title overlays (series name, episode number)
3. Add branding logos
4. Configure animated effects
5. Set YouTube/Twitch destinations

#### **Step 4: Live Broadcast**
1. Import VDO.ninja recordings into evmux
2. Add professional overlays
3. Stream live to YouTube/Twitch
4. Engage with live audience
5. Auto-publish to channel

#### **Step 5: Post-Production**
1. Video automatically saved
2. Analytics tracked
3. Highlight clips generated
4. Posted to series playlist

**Pros**:
- ✅ Best of both worlds
- ✅ Professional quality
- ✅ Live streaming capability
- ✅ Recorded content
- ✅ Automated overlays
- ✅ Multi-platform reach

**Cons**:
- ⚠️ More complex setup
- ⚠️ Higher cost

**Cost**: $50-200/episode (actors) + evmux fees

---

## **🚀 Quick Start Guide**

### **1. Access Professional Broadcast Studio**
```
Navigate to: http://localhost:3000/studio/professional-broadcast
```

### **2. Select Workflow Type**
Choose from:
- **VDO.ninja Only** - Recording only
- **evmux Only** - Streaming only
- **Hybrid** - Complete solution ⭐

### **3. Configure Settings**

**For VDO.ninja** (vdo_only or hybrid):
- Enter episode ID
- Add actors and characters
- Room automatically created

**For evmux** (evmux_only or hybrid):
- RTMP configuration auto-applied
- Web source overlays added
- Stream destinations configured

**Optional**:
- YouTube stream key (for live streaming)
- Twitch stream key (for multi-platform)

### **4. Create Workflow**
Click "Create Production Workflow"

### **5. Execute Production**
Follow the step-by-step workflow:
1. Record with VDO.ninja
2. Broadcast with evmux
3. Stream to platforms
4. Publish final episode

---

## **🎬 Detailed Setup**

### **evmux Configuration**

Your evmux credentials (pre-configured):
```typescript
RTMP URL: rtmp://rtmp1.us-east-1.evmux.com/live
App ID: app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba
Token: 7db2077153
```

**Access evmux Console**:
- Editor: https://console.evmux.com/editor/3491/244617
- Guest: https://console.evmux.com/guest/9ql-0vvq-hsm

### **Web Source Overlays**

#### **Title Overlay**
Automatically generated for each episode:
```
[Series Title]
Episode [Number]
```

#### **Lower Third**
Character names and information:
```
[Character Name]
[Additional Info]
```

#### **Animated Effects**
- Water effect: Pre-configured
- Custom animations: Add via web sources

#### **Branding Logo**
Add your channel logo (top-right corner)

---

## **📊 RTMP Streaming Setup**

### **OBS Studio Integration**

1. **Add evmux as RTMP Server**
   - Server: `rtmp://rtmp1.us-east-1.evmux.com/live`
   - Stream Key: `app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba?token=7db2077153`

2. **Add VDO.ninja as Browser Source**
   - URL: `https://vdo.ninja/?view=YourRoom&cleanoutput&autostart`
   - Width: 1920
   - Height: 1080

3. **Add Web Source Overlays**
   - Title overlay (top)
   - Lower third (bottom)
   - Logo (top-right)

4. **Start Streaming**
   - OBS sends to evmux
   - evmux distributes to YouTube/Twitch

### **FFmpeg Command Line**

```bash
ffmpeg -re -i "recording.mp4" \
  -c:v libx264 -preset veryfast -maxrate 4500k -bufsize 9000k \
  -pix_fmt yuv420p -g 60 \
  -c:a aac -b:a 128k -ar 44100 \
  -f flv "rtmp://rtmp1.us-east-1.evmux.com/live/app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba?token=7db2077153"
```

---

## **🎨 Web Sources**

### **Pre-Built Templates**

#### **Soap Opera Title**
```typescript
evmux.templates.soapOperaTitle("Domino Dynasty", 1)
```
Creates professional title overlay with:
- Series name
- Episode number
- Gradient background
- Animated entrance

#### **Lower Third**
```typescript
evmux.templates.lowerThird("Victor Sterling - CEO")
```
Adds character information:
- Character name
- Role/description
- Sliding animation

#### **Animated Water**
```typescript
evmux.templates.animatedWater()
```
Background water effect for drama

### **Custom Web Sources**

Create your own HTML overlays:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    background: linear-gradient(to right, rgba(0,0,0,0.8), transparent);
    color: #fff;
    font-family: 'Roboto', sans-serif;
  }
  .custom-overlay {
    padding: 40px;
    font-size: 60px;
    animation: fadeIn 1s;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
</head>
<body>
  <div class="custom-overlay">
    Your Custom Content
  </div>
</body>
</html>
```

Host on evmux or use data URLs.

---

## **📺 Multi-Platform Streaming**

### **YouTube Live**

1. **Get Stream Key**:
   - Go to YouTube Studio
   - Click "Create" → "Go Live"
   - Copy stream key

2. **Add to Workflow**:
   ```typescript
   youtube_stream_key: "your-youtube-key"
   ```

3. **Destination Auto-Configured**:
   - RTMP: `rtmp://a.rtmp.youtube.com/live2`
   - Key: Your stream key
   - Status: Enabled

### **Twitch**

1. **Get Stream Key**:
   - Go to Twitch Dashboard
   - Settings → Stream
   - Copy stream key

2. **Add Destination**:
   ```typescript
   evmux.addTwitchDestination("your-twitch-key")
   ```

3. **Configured**:
   - RTMP: `rtmp://live.twitch.tv/app`
   - Key: Your stream key

### **Multi-Streaming**

Stream to both simultaneously:
```typescript
destinations: [
  evmux.addYouTubeDestination("youtube-key"),
  evmux.addTwitchDestination("twitch-key")
]
```

---

## **🎛️ Quality Settings**

### **Stream Quality Presets**

| Preset | Resolution | FPS | Video Bitrate | Audio Bitrate |
|--------|------------|-----|---------------|---------------|
| **1080p60** | 1920x1080 | 60 | 6000 kbps | 192 kbps |
| **1080p30** | 1920x1080 | 30 | 4500 kbps | 128 kbps |
| **720p60** | 1280x720 | 60 | 4500 kbps | 128 kbps |
| **720p30** | 1280x720 | 30 | 2500 kbps | 128 kbps |

**Recommended**: 1080p30 for best quality/bandwidth balance

### **Bandwidth Requirements**

| Quality | Upload Speed Required |
|---------|----------------------|
| 1080p60 | 8+ Mbps |
| 1080p30 | 6+ Mbps |
| 720p60 | 6+ Mbps |
| 720p30 | 4+ Mbps |

Test your upload speed: https://fast.com

---

## **💰 Cost Analysis**

### **Complete Cost Breakdown**

#### **Hybrid Production (10 episodes/month)**

| Item | Cost |
|------|------|
| Actor Fees | $1,000-2,000 |
| VDO.ninja | $0 (free) |
| evmux Streaming | $50-100 |
| Internet (upgrade) | $50 |
| Equipment (one-time) | $500 |
| **Monthly Total** | **$1,100-2,150** |
| **Per Episode** | **$110-215** |

#### **AI Only (comparison)**

| Item | Cost |
|------|------|
| Claude Scripts | $0.30 |
| Veo 3 Videos | $60-180 |
| **Per Episode** | **$60-180** |

#### **ROI Calculation**

**With 10,000 subscribers and monetization**:
- YouTube ad revenue: $500-1,500/month
- Sponsorships: $500-2,000/month
- **Total Revenue**: $1,000-3,500/month
- **Net Profit**: -$100 to $2,400/month

**Break-even**: ~5,000 subscribers

---

## **🎓 Example: Domino Entertainment**

### **Pre-Configured Setup**

The studio includes pre-configured settings for Domino Entertainment:

```typescript
// Domino Dynasty production
const production = evmux.createDominoProductionSetup(
  episodeId,
  'Domino Dynasty',
  1,
  'DominoDynasty'
);
```

**Includes**:
- VDO.ninja room: `DominoDynasty`
- evmux RTMP: Pre-configured
- Title overlay: "Domino Dynasty - Episode 1"
- Branding: Ready for logo
- Quality: 1080p30

### **Complete Workflow**

1. **Create Workflow**:
   - Episode ID: Your episode UUID
   - Workflow: Hybrid
   - Actors: Add cast members

2. **Record**:
   - VDO.ninja room opens
   - Actors join
   - Record scenes

3. **Broadcast**:
   - evmux configured
   - Title overlay added
   - Stream to YouTube

4. **Publish**:
   - Auto-upload to channel
   - Add to Dynasty playlist
   - Notify subscribers

---

## **🔧 Technical Integration**

### **API Usage**

#### **Create Broadcast Session**
```typescript
POST /api/streaming/broadcast/create
{
  "episode_id": "uuid",
  "quality": "1080p30",
  "evmux_config": {
    "rtmpUrl": "rtmp://rtmp1.us-east-1.evmux.com/live",
    "appId": "app-b6zHr3-...",
    "token": "7db2077153"
  },
  "destinations": [
    {
      "platform": "youtube",
      "rtmpUrl": "rtmp://a.rtmp.youtube.com/live2",
      "streamKey": "your-key"
    }
  ]
}
```

#### **Create Complete Workflow**
```typescript
POST /api/streaming/workflow/create
{
  "episode_id": "uuid",
  "workflow_type": "hybrid",
  "vdo_config": {
    "roomId": "Episode1",
    "actors": [
      { "name": "John", "character": "Victor" }
    ]
  },
  "evmux_config": { ... },
  "youtube_stream_key": "optional-key"
}
```

### **Database Tracking**

All broadcasts tracked in:
- `broadcast_sessions` - RTMP sessions
- `web_sources` - Overlay graphics
- `stream_destinations` - YouTube/Twitch
- `stream_metrics` - Real-time analytics
- `production_workflows` - Complete workflows

---

## **📊 Analytics & Monitoring**

### **Real-Time Metrics**

Track during broadcast:
- Viewer count
- Bitrate (kbps)
- FPS (frames per second)
- Dropped frames
- CPU usage
- Bandwidth
- Latency
- Quality score

### **Post-Broadcast Analytics**

Review after stream:
- Total viewers
- Peak viewers
- Average watch time
- Chat engagement
- Platform breakdown
- Revenue (if monetized)

---

## **🆘 Troubleshooting**

### **Connection Issues**

**Problem**: Can't connect to RTMP server
- Verify RTMP URL and stream key
- Check firewall settings
- Test with different encoder
- Contact evmux support

**Problem**: High latency
- Reduce video bitrate
- Use wired connection
- Close bandwidth-heavy applications
- Try different RTMP server region

### **Quality Issues**

**Problem**: Pixelated video
- Increase bitrate
- Reduce resolution
- Check internet upload speed
- Verify encoder settings

**Problem**: Dropped frames
- Lower quality preset
- Close other applications
- Use hardware encoding (NVENC, QuickSync)
- Upgrade computer CPU/GPU

### **Overlay Issues**

**Problem**: Web source not showing
- Verify URL is accessible
- Check z-index ordering
- Refresh web source
- Test in browser first

---

## **🎉 Success Tips**

### **Before Going Live**

1. **Test Everything**:
   - Record test stream
   - Verify all overlays
   - Check audio levels
   - Test platform destinations

2. **Prepare Backups**:
   - Second internet connection
   - Backup computer
   - Pre-recorded intro/outro
   - Emergency contact list

3. **Promote Stream**:
   - Announce on social media
   - Email subscribers
   - Create countdown
   - Share stream links

### **During Broadcast**

1. **Monitor Quality**:
   - Watch stream on second device
   - Check bitrate/FPS
   - Monitor chat/comments
   - Adjust settings if needed

2. **Engage Audience**:
   - Read and respond to chat
   - Ask questions
   - Show behind-the-scenes
   - Thank supporters

3. **Handle Issues**:
   - Have tech support ready
   - Know how to switch to backup
   - Stay calm and professional
   - Communicate with audience

### **After Broadcast**

1. **Save Recording**:
   - Download from platform
   - Backup to cloud storage
   - Create highlight clips
   - Export for editing

2. **Review Analytics**:
   - Check viewer stats
   - Review engagement
   - Identify best moments
   - Plan improvements

3. **Follow Up**:
   - Thank viewers
   - Share recording link
   - Announce next stream
   - Request feedback

---

## **📚 Resources**

- **evmux Website**: https://evmux.com
- **evmux Documentation**: https://docs.evmux.com
- **VDO.ninja Guide**: `/docs/VDO_NINJA_GUIDE.md`
- **API Reference**: `/docs/API_REFERENCE.md`

---

## **🚀 Next Steps**

1. **Try Hybrid Workflow**:
   - Create test episode
   - Record with VDO.ninja
   - Broadcast with evmux
   - Stream to YouTube

2. **Experiment with Overlays**:
   - Try different templates
   - Create custom web sources
   - Test animations
   - Brand your stream

3. **Scale Production**:
   - Add more actors
   - Multiple series
   - Regular schedule
   - Build audience

---

**🎬 You now have a complete professional broadcasting system! Create amazing content and grow your audience!**
