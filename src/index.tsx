import * as React from 'react'
import styles from './styles.module.css'
import * as faceapi from 'face-api.js';

interface MirrorProps {
  handle_video_element: (video_element: HTMLVideoElement, canvas_element: HTMLCanvasElement) => void
}
interface MirrorState {
};

class Mirror extends React.Component<MirrorProps, MirrorState> {
  video_reference: HTMLVideoElement | null = null
  canvas_reference: HTMLCanvasElement
  set_video_reference = (element: HTMLVideoElement) => {
    this.video_reference = element
  }
  set_canvas_reference = (element: HTMLCanvasElement) => {
    this.canvas_reference = element
  }
  async componentDidMount() {
    if (this.video_reference) {
      let video_stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      this.video_reference.srcObject = video_stream
      this.props.handle_video_element(this.video_reference, this.canvas_reference)
    }
  }
  render() {
    return (
      <div>
        <video
          ref={this.set_video_reference}
          id="player"
          autoPlay
          width="400"
          height="400"
          style={{
            position: "absolute"
          }}
        >
        </video>
        <canvas
          ref={this.set_canvas_reference}
          id="canvas"
          width="400"
          height="400"
          style={{
            position: "absolute",
          }}
        >
        </canvas>
      </div>
    )
  }
}


interface Props {
  weights_path: string
  show: boolean
  callback_function: (adult: boolean, age: number) => void
}
interface State {
  weights_path: string
  show: boolean
}

class ChildGuard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {
      weights_path: props.weights_path,
      show: props.show
    };
    this.handle_video_element = this.handle_video_element.bind(this);
  }

  async handle_video_element(video_element: HTMLVideoElement, canvas_element: HTMLCanvasElement) {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(this.state.weights_path)
    console.log("faceapi loaded.")

    // for resizing the overlay canvas to the video dimensions
    const displaySize = { width: video_element.width, height: video_element.height }
    console.log(video_element.height)
    faceapi.matchDimensions(canvas_element, displaySize)
    console.log("canvas resized.")

    const detections = await faceapi.detectSingleFace(video_element).withFaceLandmarks().withAgeAndGender()
    console.log("stucked?")
    if (detections) {
      console.log("working...")
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      faceapi.draw.drawDetections(canvas_element, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas_element, resizedDetections)
    } else {
      console.log("undefine...")
    }
  }

  render() {
    return (
      this.state.show ?
        <div
          className={styles.test}
        >
          <Mirror
            handle_video_element={this.handle_video_element}
          ></Mirror>
        </div>
        :
        null
    )
  }
}

export { ChildGuard }