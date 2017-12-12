// @flow
import React, { Component } from "react";
import _ from "lodash";

// keys
const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const DOWN = 40;
const ENTER = 13;
const BROWSER_BACK = 8;
const WEBOS_BACK = 461;
const TIZEN_BACK = 10009;
const WEBOS_YELLOW_KEY = 405;
const TIZEN_YELLOW_KEY = 405;
const WEBOS_BLUE_KEY = 406;
const TIZEN_BLUE_KEY = 406;
const PC_YELLOW_PSEUDO_KEY = 17; // ctrl
const PC_BLUE_PSEUDO_KEY = 18; // alt
const KEY_ZERO = 48;
const KEY_ONE = 49;
const KEY_TWO = 50;
const KEY_THREE = 51;
const KEY_FOUR = 52;
const KEY_FIVE = 53;
const KEY_SIX = 54;
const KEY_SEVEN = 55;
const KEY_EIGHT = 56;
const KEY_NINE = 57;
const NUM_KEY_ZERO = 96;
const NUM_KEY_ONE = 97;
const NUM_KEY_TWO = 98;
const NUM_KEY_THREE = 99;
const NUM_KEY_FOUR = 100;
const NUM_KEY_FIVE = 101;
const NUM_KEY_SIX = 102;
const NUM_KEY_SEVEN = 103;
const NUM_KEY_EIGHT = 104;
const NUM_KEY_NINE = 105;

export type Vertice = {
  node: HTMLElement,
  name: string,
  left?: string,
  up?: string,
  down?: string,
  right?: string,
  focusOnEnter: ?string
};

type PathfinderState = {
  vertices: Array<Vertice>,
  current_vertice: ?Vertice
};

export default class Pathfinder extends Component<any, PathfinderState> {
  remoteHandler: Function;
  handleEnter: Function;
  defineVertice: Function;
  setupInitial: Function;
  refChild: Component<any>;
  state: PathfinderState = {
    vertices: [],
    current_vertice: null
  };
  remoteHandler = (
    e: SyntheticKeyboardEvent<HTMLButtonElement> | number
  ): void => {
    let _obj = typeof e === "object";
    let code = _obj ? e.keyCode : e;
    switch (code) {
      case ENTER:
        _obj && e.preventDefault();
        if (this.state) this.handleEnter(this.state.current_vertice);
        break;
      case BROWSER_BACK:
      case WEBOS_BACK:
      case TIZEN_BACK:
        if (
          this.state.current_vertice &&
          this.state.current_vertice.node &&
          this.state.current_vertice.node.tagName !== "INPUT"
        ) {
          _obj && e.preventDefault();
          this.handleBack();
        }
        break;
      case WEBOS_YELLOW_KEY:
      case TIZEN_YELLOW_KEY:
      case PC_YELLOW_PSEUDO_KEY:
        _obj && e.preventDefault();
        this.handleYellowKey();
        break;
      case WEBOS_BLUE_KEY:
      case TIZEN_BLUE_KEY:
      case PC_BLUE_PSEUDO_KEY:
        _obj && e.preventDefault();
        this.handleBlueKey();
        break;
      case LEFT:
        this.handleLeftKey();
        break;
      case RIGHT:
        this.handleRightKey();
        break;
      case UP:
        this.handleUpKey();
        break;
      case DOWN:
        this.handleDownKey();
        break;
      default:
        this.handleKey(e.keyCode);
    }
  };
  handleKey = (code: number): void => {
    if (typeof this.refChild.handleKey === "function")
      this.refChild.handleKey(code);
  };
  handleLeftKey = (): void => {
    if (typeof this.refChild.handleLeftKey === "function")
      this.refChild.handleLeftKey();
    else this.changeVerticeByDirection("left");
  };
  handleRightKey = (): void => {
    if (typeof this.refChild.handleRightKey === "function")
      this.refChild.handleRightKey();
    else this.changeVerticeByDirection("right");
  };
  handleUpKey = (): void => {
    if (typeof this.refChild.handleUpKey === "function")
      this.refChild.handleUpKey();
    else this.changeVerticeByDirection("up");
  };
  handleDownKey = (): void => {
    if (typeof this.refChild.handleDownKey === "function")
      this.refChild.handleDownKey();
    else this.changeVerticeByDirection("down");
  };
  handleEnter = (vertice: ?Vertice): void => {
    if (!vertice) return;
    if (vertice.to) {
      this.props.history.push(vertice.to);
      return;
    }
    if (vertice.node && vertice.node.tagName !== "INPUT") {
      vertice.node.click();
    } else if (vertice.focusOnEnter) {
      this.changeVertice(vertice.focusOnEnter);
    }
  };
  handleBack = (): void => {
    this.props.history.goBack();
  };
  handleYellowKey = (): void => {
    if (typeof this.refChild.handleYellowKey === "function")
      this.refChild.handleYellowKey();
  };
  handleBlueKey = (): void => {
    if (typeof this.refChild.handleBlueKey === "function")
      this.refChild.handleBlueKey();
  };
  checkWrappedComponent = (ref: ?Component<any>): void => {
    if (!ref) return;
    if (ref.getWrappedInstance) {
      try {
        this.refChild = ref.getWrappedInstance();
      } catch (e) {
        return console.error(e);
      }
    } else {
      this.refChild = ref;
    }
  };
  setupInitial = (vertice: string | Vertice): void => {
    this.changeVertice(vertice);
  };
  defineVertice = (vertice: Vertice): void => {
    let verticeIndex = _.findIndex(this.state.vertices, {
      name: vertice.name
    });
    let vertices = this.state.vertices;
    if (verticeIndex >= 0) _.assign(vertices[verticeIndex], vertice);
    else {
      vertices.push(vertice);
      this.setState({ vertices: vertices });
    }
  };
  changeVertice = (new_vertice: Vertice | string): void => {
    if (!new_vertice) return;
    if (typeof new_vertice === "string") {
      new_vertice = _.find(this.state.vertices, { name: new_vertice });
    }
    if (!new_vertice) return;
    this.setState({ current_vertice: new_vertice });
    this.setupFocus(new_vertice.node);
  };
  changeVerticeByDirection = (direction: string): void => {
    if (!this.state.current_vertice) return;
    // condition for free replacing caret into input element
    // focus replaces to another vertice only when caret starts or ends of input value
    if (
      this.state.current_vertice.node.tagName === "INPUT" &&
      ((this.state.current_vertice.node.selectionStart !== 0 &&
        direction === "left") ||
        (direction === "right" &&
          this.state.current_vertice.node.selectionStart !==
            this.state.current_vertice.node.value.length))
    ) {
      return;
    }
    if (this.state.current_vertice[direction])
      this.changeVertice(this.state.current_vertice[direction]);
    else this.setupFocus(this.state.current_vertice.node);
  };
  setupFocus = (node: HTMLElement): void => {
    if (node) node.focus();
  };
  componentDidMount() {
    window.addEventListener("keydown", this.remoteHandler);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.remoteHandler);
  }
  render() {
    return (
      <div className="pathfinder" style={{ position: "relative" }}>
        {this.props &&
          React.cloneElement(this.props.children, {
            ref: ref => this.checkWrappedComponent(ref),
            defineVertice: this.defineVertice,
            setupInitial: this.setupInitial
          })}
      </div>
    );
  }
}
