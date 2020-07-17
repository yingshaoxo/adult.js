import * as React from 'react'
import styles from './styles.module.css'
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';



interface WebcamProps {
  webcamRef: React.RefObject<Webcam & HTMLVideoElement>
  handle_video_element: () => void
}

class WebcamCapture extends React.Component<WebcamProps> {
  componentDidMount() {
    this.props.handle_video_element()
  }

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };

    return (
      <Webcam
        ref={this.props.webcamRef}
        videoConstraints={videoConstraints}
      />
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
  webcamRef: React.RefObject<Webcam & HTMLVideoElement>
}

class ChildGuard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {
      weights_path: props.weights_path,
      show: props.show,
      webcamRef: React.createRef<Webcam & HTMLVideoElement>(),
    };
    this.handle_video_element = this.handle_video_element.bind(this)
    this.detection = this.detection.bind(this)
  }

  async detection() {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
      const blob = this.state.webcamRef?.current?.getScreenshot()
      //console.log(blob)
      if (blob) {
        const img = await faceapi.fetchImage(blob);
        const detections = await faceapi.detectSingleFace(img, options).withAgeAndGender()
        console.log(detections)
      }

      setTimeout(async () => {
        this.detection()
      }, 1500)
  }

  async handle_video_element() {
    await faceapi.nets.tinyFaceDetector.loadFromUri(this.state.weights_path)
    await faceapi.nets.ageGenderNet.loadFromUri(this.state.weights_path)
    console.log("faceapi loaded.")

    this.detection()
  }

  render() {
    return (
      this.state.show ?
        <div
          className={styles.test}
        >
          <WebcamCapture
            webcamRef={this.state.webcamRef}
            handle_video_element={this.handle_video_element}
          ></WebcamCapture>
        </div>
        :
        null
    )
  }
}

export { ChildGuard }