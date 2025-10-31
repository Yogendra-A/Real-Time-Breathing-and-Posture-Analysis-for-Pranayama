# import cv2
# import math
# import time
# import mediapipe as mp
# import asyncio
# import websockets  # The server library
# import numpy as np
# import base64
# import json

# # --- MediaPipe Initialization ---
# mp_hands = mp.solutions.hands
# mp_pose = mp.solutions.pose
# mp_drawing = mp.solutions.drawing_utils  # For drawing the skeleton
# hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5)
# pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# HAND_THUMB_TIP = 4
# HAND_INDEX_TIP = 8

# # --- Constants from your script ---
# HAND_NOSE_DIST_FRAC = 0.09
# BREATH_MIN_SECONDS = 0.5
# SPINE_DEVIATION_DEG = 15.0
# ELBOW_MIN = 60
# ELBOW_MAX = 160

# # --- Drawing Specs ---
# COLOR_OK = (0, 255, 0)  # Green
# COLOR_BAD = (0, 0, 255) # Red
# SPINE_LANDMARKS = [
#     mp_pose.PoseLandmark.LEFT_SHOULDER,
#     mp_pose.PoseLandmark.RIGHT_SHOULDER,
#     mp_pose.PoseLandmark.LEFT_HIP,
#     mp_pose.PoseLandmark.RIGHT_HIP
# ]
# ELBOW_LANDMARKS = [
#     mp_pose.PoseLandmark.RIGHT_SHOULDER,
#     mp_pose.PoseLandmark.RIGHT_ELBOW,
#     mp_pose.PoseLandmark.RIGHT_WRIST
# ]

# # --- Helper Functions (from your script) ---
# def lm_to_pt(lm, w, h):
#     return (lm.x * w, lm.y * h)

# def angle_between_points(a, b, c):
#     ab = (a[0] - b[0], a[1] - b[1])
#     cb = (c[0] - b[0], c[1] - b[1])
#     dot = ab[0] * cb[0] + ab[1] * cb[1]
#     mag_ab = math.hypot(*ab)
#     mag_cb = math.hypot(*cb)
#     if mag_ab == 0 or mag_cb == 0:
#         return 0.0
#     cosv = max(min(dot / (mag_ab * mag_cb), 1.0), -1.0)
#     return math.degrees(math.acos(cosv))

# def distance(p1, p2):
#     return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

# # --- Main Processing Logic ---
# def process_frame(frame, state):
#     h, w = frame.shape[:2]
#     # Flip the frame horizontally (like a mirror) to match the user's view
#     frame_flipped = cv2.flip(frame, 1) 
    
#     # Create a copy to draw on
#     frame_to_draw = frame_flipped.copy()

#     rgb = cv2.cvtColor(frame_flipped, cv2.COLOR_BGR2RGB)
#     rgb.flags.writeable = False # Optimize
    
#     hands_res = hands.process(rgb)
#     pose_res = pose.process(rgb)
    
#     nose_px = None
#     spine_ok = False
#     elbow_ok = False
#     side_candidate = None
#     spine_dev = 0.0
#     r_angle = 0.0

#     feedback = {
#         "spine_ok": False,
#         "spine_dev": 0.0,
#         "elbow_ok": False,
#         "elbow_angle": 0.0,
#         "active_side": "None",
#         "breaths_left": state["breaths_left"],
#         "breaths_right": state["breaths_right"],
#         "process_count": state["process_count"]
#     }

#     # ----------------- Pose checks -----------------
#     if pose_res.pose_landmarks:
#         lm = pose_res.pose_landmarks.landmark

#         left_sh = lm_to_pt(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], w, h)
#         right_sh = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER], w, h)
#         left_hip = lm_to_pt(lm[mp_pose.PoseLandmark.LEFT_HIP], w, h)
#         right_hip = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_HIP], w, h)

#         shoulder_mid = ((left_sh[0] + right_sh[0]) / 2, (left_sh[1] + right_sh[1]) / 2)
#         hip_mid = ((left_hip[0] + right_hip[0]) / 2, (left_hip[1] + right_hip[1]) / 2)
#         spine_anchor = (hip_mid[0] + 0.3 * (shoulder_mid[0] - hip_mid[0]),
#                         hip_mid[1] + 0.3 * (shoulder_mid[1] - hip_mid[1]))

#         v = (spine_anchor[0] - shoulder_mid[0], spine_anchor[1] - shoulder_mid[1])
#         if v[1] != 0: # Avoid division by zero
#              spine_dev = abs(math.degrees(math.atan2(v[0], v[1])))
#         else:
#              spine_dev = 90.0 if v[0] > 0 else -90.0
             
#         spine_ok = spine_dev <= SPINE_DEVIATION_DEG

#         r_sh_pt = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER], w, h)
#         r_el_pt = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_ELBOW], w, h)
#         r_wr_pt = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_WRIST], w, h)
#         r_angle = angle_between_points(r_sh_pt, r_el_pt, r_wr_pt)
#         elbow_ok = ELBOW_MIN <= r_angle <= ELBOW_MAX

#         nose_lm = lm[mp_pose.PoseLandmark.NOSE]
#         nose_px = (int(nose_lm.x * w), int(nose_lm.y * h))
        
#         feedback.update({"spine_ok": spine_ok, "spine_dev": spine_dev, "elbow_ok": elbow_ok, "elbow_angle": r_angle})

#         # --- NEW: Draw Skeleton ---
#         spine_color = COLOR_OK if spine_ok else COLOR_BAD
#         elbow_color = COLOR_OK if elbow_ok else COLOR_BAD

#         # Draw custom spine line (like in original possestmation.py)
#         cv2.line(frame_to_draw, (int(shoulder_mid[0]), int(shoulder_mid[1])), (int(spine_anchor[0]), int(spine_anchor[1])), spine_color, 3)

#         # Draw right elbow
#         cv2.line(frame_to_draw, (int(r_sh_pt[0]), int(r_sh_pt[1])), (int(r_el_pt[0]), int(r_el_pt[1])), elbow_color, 3)
#         cv2.line(frame_to_draw, (int(r_el_pt[0]), int(r_el_pt[1])), (int(r_wr_pt[0]), int(r_wr_pt[1])), elbow_color, 3)
        
#         # Draw key points
#         cv2.circle(frame_to_draw, (int(r_sh_pt[0]), int(r_sh_pt[1])), 5, elbow_color, -1)
#         cv2.circle(frame_to_draw, (int(r_el_pt[0]), int(r_el_pt[1])), 5, elbow_color, -1)
#         cv2.circle(frame_to_draw, (int(r_wr_pt[0]), int(r_wr_pt[1])), 5, elbow_color, -1)
#         cv2.circle(frame_to_draw, (int(shoulder_mid[0]), int(shoulder_mid[1])), 5, spine_color, -1)
#         cv2.circle(frame_to_draw, (int(spine_anchor[0]), int(spine_anchor[1])), 5, spine_color, -1)
#         # --- End of Draw Skeleton ---

#     # ----------------- Hand checks -----------------
#     if hands_res.multi_hand_landmarks and nose_px:
#         diag = math.hypot(w, h)
#         threshold = HAND_NOSE_DIST_FRAC * diag
#         closest_dist = float("inf")
#         closest_side = None

#         for hand_lms in hands_res.multi_hand_landmarks:
#             thumb = lm_to_pt(hand_lms.landmark[HAND_THUMB_TIP], w, h)
#             idx = lm_to_pt(hand_lms.landmark[HAND_INDEX_TIP], w, h)
#             avg_x = (thumb[0] + idx[0]) / 2
#             avg_y = (thumb[1] + idx[1]) / 2
#             d = distance((avg_x, avg_y), nose_px)
#             if d < closest_dist and d <= threshold:
#                 closest_dist = d
#                 # Check which side of the nose the hand is on
#                 # Note: Since the image is flipped, avg_x < nose_px[0] means the hand is on the user's RIGHT
#                 closest_side = "R" if avg_x < nose_px[0] else "L"

#         side_candidate = closest_side

#     # ----------------- Count breaths (using state) -----------------
#     now = time.time()
#     if side_candidate != state["active_side"]:
#         if state["active_side"] and (now - state["side_since"]) >= BREATH_MIN_SECONDS:
#             if state["active_side"] == "R": # Hand on Right nostril
#                 state["breaths_left"] += 1  # ...means breathing LEFT
#             elif state["active_side"] == "L": # Hand on Left nostril
#                 state["breaths_right"] += 1 # ...means breathing RIGHT
            
#             if state["last_completed_side"] is None:
#                 state["last_completed_side"] = state["active_side"]
#             else:
#                 if state["active_side"] != state["last_completed_side"]:
#                     state["process_count"] += 1
#                     state["last_completed_side"] = None
#                 else:
#                     state["last_completed_side"] = state["active_side"]
                    
#         state["active_side"] = side_candidate
#         state["side_since"] = now

#     # Update feedback with current state
#     side_text = "None"
#     if state["active_side"] == "R":
#         side_text = "Right closed (Breathing LEFT)"
#     elif state["active_side"] == "L":
#         side_text = "Left closed (Breathing RIGHT)"
    
#     feedback.update({
#         "active_side": side_text,
#         "breaths_left": state["breaths_left"],
#         "breaths_right": state["breaths_right"],
#         "process_count": state["process_count"]
#     })

#     # --- NEW: Encode drawn frame to base64 ---
#     _, buffer = cv2.imencode('.jpg', frame_to_draw, [cv2.IMWRITE_JPEG_QUALITY, 80])
#     img_base64 = base64.b64encode(buffer).decode('utf-8')
#     feedback["image_with_skeleton"] = f"data:image/jpeg;base64,{img_base64}"
#     # --- End of Encode ---

#     return feedback, state


# # --- WebSocket Server Logic ---
# async def handler(websocket):
#     print("Client connected.")
#     # Initialize state for each connection
#     client_state = {
#         "active_side": None,
#         "side_since": time.time(),
#         "breaths_left": 0,
#         "breaths_right": 0,
#         "process_count": 0,
#         "last_completed_side": None
#     }
    
#     try:
#         # The 'path' argument is no longer needed here
#         async for message in websocket:
#             # 1. Receive base64 image string from client
#             data = json.loads(message)
#             if data['type'] == 'frame':
#                 # Remove "data:image/jpeg;base64,"
#                 img_data = data['image'].split(',')[1] 
#                 img_bytes = base64.b64decode(img_data)
                
#                 # 2. Convert to OpenCV frame
#                 nparr = np.frombuffer(img_bytes, np.uint8)
#                 frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#                 # 3. Process the frame
#                 #    The 'feedback' dict now contains the base64 image
#                 feedback, client_state = process_frame(frame, client_state)
                
#                 # 4. Send JSON feedback (with image) back to client
#                 await websocket.send(json.dumps(feedback))

#     except websockets.exceptions.ConnectionClosed:
#         print("Client disconnected.")
#     finally:
#         print("Connection handler finished.")

# async def main():
#     # Start the WebSocket server on localhost, port 8765
#     async with websockets.serve(handler, "localhost", 8765):
#         print("WebSocket server started at ws://localhost:8765")
#         await asyncio.Future()  # Run forever

# if __name__ == "__main__":
#     # This server will run indefinitely until you stop it (e.g., with Ctrl+C)
#     print("Starting server...")
#     asyncio.run(main())

import cv2
import math
import time
import mediapipe as mp
import asyncio
import websockets
import json
import base64
import numpy as np

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils # For drawing skeletons
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5)

# -----------------------------
# Config (from your possestmation.py)
# -----------------------------
SPINE_DEVIATION_DEG = 15.0
ELBOW_MIN = 60
ELBOW_MAX = 160
HAND_NOSE_DIST_FRAC = 0.09
BREATH_MIN_SECONDS = 0.5
SMOOTHING_WINDOW = 5

HAND_THUMB_TIP = 4
HAND_INDEX_TIP = 8

# State variables (will be reset for each connection)
class SessionState:
    def __init__(self):
        self.history = []
        self.active_side = None
        self.side_since = time.time()
        self.breaths_left = 0
        self.breaths_right = 0
        self.process_count = 0
        self.last_completed_side = None
        print("New SessionState created.")

# -----------------------------
# Helpers
# -----------------------------
def lm_to_pt(lm, w, h):
    return (int(lm.x * w), int(lm.y * h)) # Ensure integer coords

def angle_between_points(a, b, c):
    ab = (a[0] - b[0], a[1] - b[1])
    cb = (c[0] - b[0], c[1] - b[1])
    dot = ab[0] * cb[0] + ab[1] * cb[1]
    mag_ab = math.hypot(*ab)
    mag_cb = math.hypot(*cb)
    if mag_ab == 0 or mag_cb == 0:
        return 0.0
    cosv = max(min(dot / (mag_ab * mag_cb), 1.0), -1.0)
    return math.degrees(math.acos(cosv))

def distance(p1, p2):
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

def decode_image(data_uri):
    try:
        header, encoded = data_uri.split(",", 1)
        img_data = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def encode_image_to_base64(img):
    try:
        _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 80])
        return base64.b64encode(buffer).decode("utf-8")
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None

# -----------------------------
# Pose Estimation Logic (The Core)
# -----------------------------
def process_frame(frame, state: SessionState):
    h, w = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process with MediaPipe
    pose_res = pose.process(rgb)
    hands_res = hands.process(rgb)

    nose_px = None
    spine_ok = False
    elbow_ok = False
    side_candidate = None
    spine_dev = 0.0
    r_angle = 0.0
    
    # --- Drawing Specs ---
    GREEN = (0, 255, 0)
    RED = (0, 0, 255)
    BLUE = (255, 0, 0)
    WHITE = (255, 255, 255)
    
    spine_color = RED
    elbow_color = RED
    
    # ----------------- Pose checks -----------------
    if pose_res.pose_landmarks:
        lm = pose_res.pose_landmarks.landmark

        # Get keypoints
        left_sh = lm_to_pt(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], w, h)
        right_sh = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER], w, h)
        left_hip = lm_to_pt(lm[mp_pose.PoseLandmark.LEFT_HIP], w, h)
        right_hip = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_HIP], w, h)
        r_el = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_ELBOW], w, h)
        r_wr = lm_to_pt(lm[mp_pose.PoseLandmark.RIGHT_WRIST], w, h)
        
        # 1. Spine Check
        shoulder_mid = ((left_sh[0] + right_sh[0]) / 2, (left_sh[1] + right_sh[1]) / 2)
        hip_mid = ((left_hip[0] + right_hip[0]) / 2, (left_hip[1] + right_hip[1]) / 2)
        spine_anchor = (hip_mid[0] + 0.3 * (shoulder_mid[0] - hip_mid[0]),
                        hip_mid[1] + 0.3 * (shoulder_mid[1] - hip_mid[1]))

        v = (spine_anchor[0] - shoulder_mid[0], spine_anchor[1] - shoulder_mid[1])
        spine_dev = abs(math.degrees(math.atan2(v[0], v[1])))
        spine_ok = spine_dev <= SPINE_DEVIATION_DEG
        spine_color = GREEN if spine_ok else RED
        
        # Draw Spine
        cv2.line(frame, (int(shoulder_mid[0]), int(shoulder_mid[1])), (int(spine_anchor[0]), int(spine_anchor[1])), spine_color, 3)
        cv2.circle(frame, (int(shoulder_mid[0]), int(shoulder_mid[1])), 5, spine_color, -1)
        cv2.circle(frame, (int(spine_anchor[0]), int(spine_anchor[1])), 5, spine_color, -1)

        # 2. Elbow Check
        r_angle = angle_between_points(right_sh, r_el, r_wr)
        elbow_ok = ELBOW_MIN <= r_angle <= ELBOW_MAX
        elbow_color = GREEN if elbow_ok else RED
        
        # Draw Elbow
        cv2.line(frame, right_sh, r_el, elbow_color, 3)
        cv2.line(frame, r_el, r_wr, elbow_color, 3)
        cv2.circle(frame, right_sh, 5, elbow_color, -1)
        cv2.circle(frame, r_el, 5, elbow_color, -1)
        cv2.circle(frame, r_wr, 5, elbow_color, -1)
        
        # 3. Nose pixel
        nose_lm = lm[mp_pose.PoseLandmark.NOSE]
        nose_px = (int(nose_lm.x * w), int(nose_lm.y * h))
        cv2.circle(frame, nose_px, 5, WHITE, -1)

    # ----------------- Hand checks -----------------
    if hands_res.multi_hand_landmarks and nose_px:
        diag = math.hypot(w, h)
        threshold = HAND_NOSE_DIST_FRAC * diag
        closest_dist = float("inf")
        closest_side = None

        for hand_lms in hands_res.multi_hand_landmarks:
            # Draw hand skeleton
            mp_drawing.draw_landmarks(frame, hand_lms, mp_hands.HAND_CONNECTIONS)
            
            thumb = lm_to_pt(hand_lms.landmark[HAND_THUMB_TIP], w, h)
            idx = lm_to_pt(hand_lms.landmark[HAND_INDEX_TIP], w, h)
            avg_x = (thumb[0] + idx[0]) / 2
            avg_y = (thumb[1] + idx[1]) / 2
            d = distance((avg_x, avg_y), nose_px)

            if d < closest_dist and d <= threshold:
                closest_dist = d
                closest_side = "L" if avg_x < nose_px[0] else "R"

        side_candidate = closest_side
        if side_candidate == "R":
            cv2.circle(frame, nose_px, 15, BLUE, 3) # Draw circle on right
        elif side_candidate == "L":
            cv2.circle(frame, nose_px, 15, BLUE, 3) # Draw circle on left

    # ----------------- Count breaths -----------------
    now = time.time()
    side_text = "None"
    
    if side_candidate != state.active_side:
        if state.active_side and (now - state.side_since) >= BREATH_MIN_SECONDS:
            if state.active_side == "R":
                state.breaths_left += 1
            elif state.active_side == "L":
                state.breaths_right += 1
            
            if state.last_completed_side is None:
                state.last_completed_side = state.active_side
            else:
                if state.active_side != state.last_completed_side:
                    state.process_count += 1
                    state.last_completed_side = None
                else:
                    state.last_completed_side = state.active_side
        
        state.active_side = side_candidate
        state.side_since = now

    if state.active_side == "R":
        side_text = "Breathing LEFT"
    elif state.active_side == "L":
        side_text = "Breathing RIGHT"

    # ----------------- Final detection -----------------
    detected = spine_ok and elbow_ok and (state.active_side is not None)
    state.history.append(1 if detected else 0)
    if len(state.history) > SMOOTHING_WINDOW:
        state.history.pop(0)
    final_detect = (sum(state.history) / len(state.history)) >= 0.5 if state.history else False

    # --- Draw detection status ---
    status_text = "DETECTED" if final_detect else "NOT DETECTED"
    status_color = GREEN if final_detect else RED
    cv2.putText(frame, status_text, (14, 36), cv2.FONT_HERSHEY_SIMPLEX, 0.9, status_color, 2)
    
    # --- Create feedback object ---
    feedback = {
        "spine_ok": spine_ok,
        "spine_dev": spine_dev,
        "elbow_ok": elbow_ok,
        "r_angle": r_angle,
        "side_text": side_text,
        "breaths_left": state.breaths_left,
        "breaths_right": state.breaths_right,
        "process_count": state.process_count,
        "final_detect": final_detect,
    }
    
    return frame, feedback

# -----------------------------
# WebSocket Server
# -----------------------------
async def handler(websocket):
    print("Client connected.")
    state = SessionState() # Create a new state for this client
    
    try:
        async for message in websocket:
            # --- [LOGGING 1] ---
            print("Received a message from client.")
            
            data = json.loads(message)
            
            if data.get('type') == 'frame':
                # --- [LOGGING 2] ---
                print("Message is a 'frame'. Decoding...")
                
                img = decode_image(data['image'])
                if img is None:
                    print("Failed to decode image, skipping frame.")
                    continue
                
                # --- [LOGGING 3] ---
                print("Image decoded. Processing frame...")
                
                # Process the frame
                processed_frame, feedback_data = process_frame(img, state)
                
                # --- [LOGGING 4] ---
                print("Frame processed. Encoding response...")
                
                # Encode the processed frame
                encoded_image = encode_image_to_base64(processed_frame)
                
                if encoded_image:
                    response = {
                        "image": encoded_image,
                        "feedback": feedback_data
                    }
                    
                    # --- [LOGGING 5] ---
                    print("Sending response back to client...")
                    await websocket.send(json.dumps(response))
                else:
                    print("Failed to encode processed frame.")
            
            else:
                print(f"Received unknown message type: {data.get('type')}")

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")
    except Exception as e:
        print(f"An error occurred in handler: {e}")
    finally:
        print("Connection handler finished.")

async def main():
    print("Starting server...")
    async with websockets.serve(handler, "localhost", 8765, max_size=1_000_000 * 2): # Increase max_size
        print("WebSocket server started at ws://localhost:8765")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())

