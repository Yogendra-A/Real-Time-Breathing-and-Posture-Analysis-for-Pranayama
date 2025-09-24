import cv2
import pandas as pd

def apply_range(df, frame_num, total_frames, label, step=30):
    """Apply label to a block of frames"""
    end = min(frame_num + step, total_frames)
    df.loc[frame_num:end, "label"] = label
    print(f"✅ Applied '{label}' from frame {frame_num} to {end}")
    return end + 1  # move to frame after range

def labeling_tool(video_path, csv_path):
    # Load CSV
    df = pd.read_csv(csv_path)

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_num = 0

    print("Controls: n/l/r=single frame | Shift+N/L/R=next 30 frames | ←/→=prev/next | s=save | q=quit")

    while cap.isOpened():
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        if not ret:
            break

        # Show label on frame
        label = df.loc[frame_num, "label"]
        cv2.putText(frame, f"Frame {frame_num}/{total_frames} | Label: {label}",
                    (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Labeling Tool", frame)
        key = cv2.waitKey(0)

        if key == ord("q"):  # Quit
            break
        elif key == ord("n"):  # Neutral single frame
            df.loc[frame_num, "label"] = "neutral"
            frame_num += 1
        elif key == ord("l"):  # Left single frame
            df.loc[frame_num, "label"] = "left_hand_on_nose"
            frame_num += 1
        elif key == ord("r"):  # Right single frame
            df.loc[frame_num, "label"] = "right_hand_on_nose"
            frame_num += 1
        elif key == ord("N"):  # Neutral next 30 frames
            frame_num = apply_range(df, frame_num, total_frames, "neutral", 30)
        elif key == ord("L"):  # Left next 30 frames
            frame_num = apply_range(df, frame_num, total_frames, "left_hand_on_nose", 30)
        elif key == ord("R"):  # Right next 30 frames
            frame_num = apply_range(df, frame_num, total_frames, "right_hand_on_nose", 30)
        elif key == ord("s"):  # Save
            df.to_csv(csv_path, index=False)
            print(f"💾 Saved labels to {csv_path}")
        elif key == 81:  # Left arrow
            frame_num = max(0, frame_num - 1)
        elif key == 83:  # Right arrow
            frame_num = min(total_frames - 1, frame_num + 1)

    cap.release()
    cv2.destroyAllWindows()
    df.to_csv(csv_path, index=False)
    print(f"✅ Finished. Labels saved to {csv_path}")

if __name__ == "__main__":
    video_path = "videos/vid1.mp4"       # change to your video
    csv_path = "processed/csv/vid1.csv"  # change to your csv
    labeling_tool(video_path, csv_path)
