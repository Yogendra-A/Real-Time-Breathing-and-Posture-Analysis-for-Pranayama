import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import os

# Initialize Mediapipe
mp_pose = mp.solutions.pose
mp_hands = mp.solutions.hands

def extract_landmarks_from_video(video_path, npy_save_path, csv_save_path):
    cap = cv2.VideoCapture(video_path)
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    all_frames = []
    frame_num = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pose_results = pose.process(frame_rgb)
        hand_results = hands.process(frame_rgb)

        frame_landmarks = []

        # ---------------------------
        # Pose landmarks (always 99)
        # ---------------------------
        if pose_results.pose_landmarks:
            for lm in pose_results.pose_landmarks.landmark:
                frame_landmarks.extend([lm.x, lm.y, lm.z])
        else:
            frame_landmarks.extend([0] * 99)

        # ---------------------------
        # Hand landmarks (always 126 = 21*3*2)
        # ---------------------------
        hand_data = []
        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                for lm in hand_landmarks.landmark:
                    hand_data.extend([lm.x, lm.y, lm.z])

        # Pad/truncate to exactly 126
        if len(hand_data) < 126:
            hand_data.extend([0] * (126 - len(hand_data)))
        else:
            hand_data = hand_data[:126]

        frame_landmarks.extend(hand_data)

        # Add frame number and placeholder label
        all_frames.append([frame_num] + frame_landmarks + ["unknown"])
        frame_num += 1

    cap.release()
    pose.close()
    hands.close()

    # ---------------------------
    # Save as .npy and .csv
    # ---------------------------
    # Numpy array (only features, not frame/label)
    npy_data = np.array([row[1:-1] for row in all_frames], dtype=np.float32)
    np.save(npy_save_path, npy_data)

    # CSV with placeholders for labels
    num_features = npy_data.shape[1]
    columns = ["frame"] + [f"f{i}" for i in range(num_features)] + ["label"]
    df = pd.DataFrame(all_frames, columns=columns)
    df.to_csv(csv_save_path, index=False)

    print(f"Processed {video_path} → {npy_save_path}, {csv_save_path}")


if __name__ == "__main__":
    video_folder = "F:/capstone/dataset/Nadi-Shodhana/"
    output_numpy = "processed/numpy/"
    output_csv = "processed/csv/"
    os.makedirs(output_numpy, exist_ok=True)
    os.makedirs(output_csv, exist_ok=True)

    for video_file in os.listdir(video_folder):
        if video_file.endswith(".mp4") or video_file.endswith(".avi"):
            base_name = os.path.splitext(video_file)[0]
            extract_landmarks_from_video(
                os.path.join(video_folder, video_file),
                os.path.join(output_numpy, base_name + ".npy"),
                os.path.join(output_csv, base_name + ".csv")
            )
