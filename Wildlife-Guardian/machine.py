import streamlit as st
import os
os.environ['TF_USE_LEGACY_KERAS'] = '1'
import tensorflow as tf
from tensorflow import keras
from PIL import Image, ImageOps
import numpy as np
import json
import time

# Configuration - Corrected underscores
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "keras_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")

st.set_page_config(page_title="Wildlife Guardian AI", layout="centered")

# --- Iframe Styling ---
st.markdown(
    """
    <style>
    header, footer {visibility: hidden !important;}
    .block-container { padding-top: 1rem !important; }
    div[data-testid="stButton"] > button { border-radius: 12px; font-weight: 600; }
    </style>
    """,
    unsafe_allow_html=True
)

@st.cache_data
def load_labels():
    if not os.path.exists(LABELS_PATH): return ["error: labels.txt missing"]
    with open(LABELS_PATH, "r") as f:
        return [l.strip().split(" ", 1)[1].lower() if " " in l else l.strip().lower() for l in f.readlines() if l.strip()]

labels = load_labels()

@st.cache_resource
def get_model():
    if not os.path.exists(MODEL_PATH): return None
    try: 
        return keras.models.load_model(MODEL_PATH, compile=False)
    except Exception as e: 
        print(f"Model load error: {e}")
        return None

def verify_photo(model, camera_photo, current_task):
    image = Image.open(camera_photo).convert("RGB")
    size = (224, 224)
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)
    img_array = (np.asarray(image).astype(np.float32) / 127.5) - 1
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    data[0] = img_array
    prediction = model.predict(data, verbose=0)
    index = np.argmax(prediction)
    pred_name = labels[index]
    conf = float(prediction[0][index])

    is_supported = False
    pn = pred_name.lower()
    if current_task == "drink_water" and "water" in pn: is_supported = True
    elif current_task == "go_outside" and "trees" in pn: is_supported = True
    elif current_task in ["eat_food", "food"] and pn in ["mango", "strawberry", "grapes", "oranges", "banana", "apples"]: is_supported = True

    return is_supported and conf >= 0.7, pred_name, conf

def run_app():
    model = get_model()
    if not model:
        st.error("Model Error: Missing files.")
        return

    # PERSISTENT STATE across reruns
    if "result_msg" not in st.session_state:
        st.session_state.result_msg = None

    current_task = st.query_params.get("task", "unknown")
    task_label = st.query_params.get("label", "something healthy")

    st.write(f"### 🐹 Task: {task_label}")

    camera_photo = st.camera_input("Take your photo below:")

    if not camera_photo:
        st.session_state.result_msg = None
        st.info("🕒 *Step 1: Take a photo above.*")
    else:
        st.write(f"📸 **Image Received!** ({camera_photo.size} bytes)")
        
        if st.button("🚀 CLICK TO VERIFY NOW", use_container_width=True, type="primary"):
            with st.spinner("AI is verifying..."):
                is_valid, pred_name, conf = verify_photo(model, camera_photo, current_task)
                
                if is_valid:
                    st.balloons()
                    st.success(f"🏆 SUCCESS! Found {pred_name.capitalize()} ({int(conf*100)}%)")
                    st.session_state.result_msg = { "type": "taskComplete", "task": current_task, "approved": True }
                else:
                    st.error(f"🤔 REJECTED: Detected {pred_name.capitalize()} ({int(conf*100)}%)")
                    st.session_state.result_msg = { "type": "taskResult", "approved": False, "task": current_task }

        st.image(camera_photo, caption="Captured Preview", use_container_width=True)

    st.markdown("---")
    st.caption("Wildlife Guardian AI • Powered by Teachable Machine")

    # --- THE MESSAGE BRIDGE ---
    # We send the message PERSISTENTLY based on session state
    if st.session_state.result_msg:
        # Convert to JSON for JS
        msg_json = json.dumps(st.session_state.result_msg)
        st.components.v1.html(
            f"""
            <script>
                const msg = {msg_json};
                console.log("AI Script: Sending result to website...", msg);
                window.top.postMessage(msg, '*');
                window.parent.postMessage(msg, '*');
            </script>
            <div style="display:none;" id="{time.time()}"></div>
            """,
            height=0
        )
    else:
        # Handshake only if no result yet
        st.components.v1.html(
            f"""
            <script>
                window.top.postMessage({{ type: 'handshake' }}, '*');
                window.parent.postMessage({{ type: 'handshake' }}, '*');
            </script>
            <div style="display:none;" id="{time.time()}"></div>
            """,
            height=0
        )

if __name__ == "__main__":
    run_app()