import * as React from 'react'
import styles from './styles.module.css'
import * as faceapi from 'face-api.js';
import { Dialog, Paragraph } from 'evergreen-ui'

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
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
          style={{
            position: "absolute",
          }}
        >
        </canvas>
      </div>
    )
  }
}

interface DisplaySize {
  height: number
  width: number
}
interface Props {
  weights_path: string
  show: boolean
  callback_function: (adult: boolean, age: number) => void
}
interface State {
  weights_path: string
  show: boolean
  agree: boolean
  asked: boolean
  check_counting: number
  check_age_array: Array<number>
}

class ChildGuard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {
      weights_path: props.weights_path,
      show: props.show,
      agree: false,
      asked: false,
      check_counting: 0,
      check_age_array: [],
    };
    this.handle_video_element = this.handle_video_element.bind(this);
    this.detection = this.detection.bind(this)
  }

  async detection(video_element: HTMLVideoElement, canvas_element: HTMLCanvasElement, displaySize: DisplaySize) {
    const detections = await faceapi.detectSingleFace(video_element).withAgeAndGender()
    if (detections) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const age = Math.floor(resizedDetections.age)
      this.setState({
        check_age_array: [...this.state.check_age_array, age]
      })
      const drawOptions = {
        label: age.toString(),
        lineWidth: 2,
        boxColor: "#FF3D00",
      }
      const drawBox = new faceapi.draw.DrawBox(resizedDetections.detection.box, drawOptions)
      drawBox.draw(canvas_element)
    }

    if (this.state.check_counting < 3) {
      setTimeout(async () => {
        var ctx = canvas_element.getContext("2d");
        ctx?.clearRect(0, 0, canvas_element.width, canvas_element.height);
        await this.detection(video_element, canvas_element, displaySize)
      }, 1500)
      this.setState({
        check_counting: this.state.check_counting + 1
      })
    } else {
      const getMean = (array: Array<number>) => array.reduce((a, b) => a + b) / array.length;
      const mean = getMean(this.state.check_age_array)
      const adult = mean > 18 ? true : false
      this.props.callback_function(adult, Math.floor(mean))
      this.setState({
        show: false
      })
    }
  }

  async handle_video_element(video_element: HTMLVideoElement, canvas_element: HTMLCanvasElement) {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(this.state.weights_path)
    await faceapi.nets.ageGenderNet.loadFromUri(this.state.weights_path)
    console.log("faceapi loaded.")

    // for resizing the overlay canvas to the video dimensions
    const displaySize = { width: video_element.width, height: video_element.height }
    faceapi.matchDimensions(canvas_element, displaySize)

    await this.detection(video_element, canvas_element, displaySize)
  }

  canceled = () => {
    this.setState({
      asked: true,
      agree: false,
    })
    console.log("canceled")

    this.props.callback_function(false, 0)
    this.setState({
      show: false
    })
  }

  render() {
    if (this.state.asked == false) {
      return (
        <Dialog
          isShown={!this.state.asked}
          intent="danger"
          title="Attention"
          confirmLabel="Let's do it!"
          onCloseComplete={() => {
            this.canceled()
          }}
          onCancel={() => {
            this.canceled()
          }}
          onConfirm={() => {
            this.setState({
              asked: true,
              agree: true,
            })
            console.log("agreed")
          }}
        >
          <Paragraph>
            We will need to use your camera to do a check to see if you are an adult.
          </Paragraph>
          <Paragraph>
            We won't collect your data, because it's all happened on your browser.
          </Paragraph>
          <Paragraph>
            Would you willing to go on with this?
          </Paragraph>
        </Dialog>
      )
    }

    if (this.state.show && this.state.agree) {
      return (
        <div
          className={styles.test}
        >
          <Mirror
            handle_video_element={this.handle_video_element}
          ></Mirror>
        </div>
      )
    }
    else {
      return null
    }
  }
}

export { ChildGuard }