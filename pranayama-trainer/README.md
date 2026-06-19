# Pranayama Trainer — Real-Time Breathing & Posture Analysis

A real-time system that monitors Pranayama (yogic breathing) practice by fusing computer-vision-based posture tracking with an audio-based breathing classifier, giving practitioners live feedback without any wearable hardware — just a webcam and a microphone.

**Team project (PES University, Capstone Phase 3)** — 4-person team, faculty-guided. I designed and built the core technical pipeline: the video pose-detection system, the audio CNN-LSTM breathing classifier, and the WebSocket integration layer connecting them. Teammates contributed data collection, testing, and presentation materials.

## What it does

Practicing Pranayama without supervision often means incorrect posture, inconsistent breathing rhythm, and no way to know you're doing it wrong. This system addresses that with two independent signals running in parallel:

**Video stream** — MediaPipe pose and hand landmarks track:
- Spine alignment (angular deviation between shoulder midpoint and a weighted spine anchor)
- Elbow angle validity for the breathing posture
- Which nostril is being held closed (hand-to-nose proximity), used to detect left/right breath cycles

**Audio stream** — A CNN-LSTM model classifies microphone input into breathing phases (inhale/exhale/hold) and sound categories (normal/crackle/wheeze), trained on recorded Pranayama sessions:
- CNN layers extract spatial features from audio spectrograms (MFCCs, log-mel)
- LSTM layers capture the temporal rhythm of breathing over time
- Additional handcrafted features (zero-crossing rate, RMS energy) feed into the classification

The two streams run independently and their outputs are combined into a unified **Breathing Quality Score** that reflects timing accuracy, rhythm consistency, and posture correctness.

## Why this architecture

**Two modalities instead of one** — An early version used only the video-based CNN classifier for posture. It worked for static pose checks but couldn't reliably judge breathing rate or rhythm, since breathing is fundamentally a time-based signal that a single video frame doesn't capture. Adding the audio stream, classified with an LSTM specifically because it models temporal sequences, closed that gap.

**MediaPipe over a custom-trained pose model** — Training a pose estimator from scratch wasn't a reasonable scope given the project timeline; MediaPipe's pretrained landmark detection let the engineering effort go into the breathing-specific logic on top (spine deviation thresholds, elbow angle ranges, hand-to-nostril proximity) rather than re-solving general pose estimation.

**CNN-LSTM over a simpler audio threshold** — A pure amplitude-threshold approach (count a breath when volume crosses a level) is simple but fragile — it can't distinguish a real breath from background noise, and can't classify breath *quality* (e.g., wheeze vs. normal). The CNN-LSTM model trades implementation simplicity for the ability to learn breathing-sound patterns from real recorded data, at the cost of needing a trained model and a labeled dataset.

**WebSocket over REST polling** — Both streams need near-continuous updates (live video frames, ongoing audio analysis). A persistent WebSocket connection avoids the overhead of repeated HTTP requests and fits a continuous-stream workload better than request/response polling.

## What I'd improve next

- Audio data was collected via phone + earbuds in varied conditions; a larger, more controlled dataset would improve classifier reliability — the model currently shows strong recall on "normal" breathing (1.00) but weaker precision on "wheeze" (0.40), reflecting limited training examples for that class.
- The fusion logic combining video and audio signals into the final Breathing Quality Score is currently a relatively simple rule-based combination; a learned fusion approach could better weight the two modalities under different conditions (e.g., noisy environments where audio is less reliable).
- Wearable sensor integration (mentioned as future work in our final report) would reduce sensitivity to camera lighting and microphone background noise — the two main failure modes we observed.

## Results

CNN-LSTM breathing classifier achieved 78.4% test accuracy (test loss 0.4698) across three sound categories (normal, crackle, wheeze), with strongest performance on the dominant "normal" class (recall 1.00, precision 0.68).

## Stack

- **Backend:** Python, OpenCV, MediaPipe (pose + hand landmarks), Librosa (audio feature extraction), TensorFlow/Keras (CNN-LSTM model), `websockets`
- **Frontend:** React (Vite), Tailwind CSS, native WebSocket client, `getUserMedia` for webcam + mic capture
- **ML:** CNN-LSTM trained on MFCC/log-mel audio features, 50 epochs with dropout regularization

## Running it

**Backend:**
```bash
cd pranayama-trainer/backend
pip install websockets opencv-python mediapipe numpy librosa tensorflow
python app.py
```

**Frontend:**
```bash
cd pranayama-trainer
npm install
npm run dev
```

## Project context

Built as a 4-person Capstone project at PES University (Project ID 97, guided by Dr. Nazmin Begum). Submitted to the 22nd International Conference on Intelligent Environments (IE 2026), Porto — currently under review.
