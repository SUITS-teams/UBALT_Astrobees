import { ImmersiveApp, PrismType, ui, HandGestureFlags, input, GestureInputEventData, color } from 'lumin';
import '../node_modules/gl-matrix/esm/common.js';
import '../node_modules/gl-matrix/esm/mat3.js';
import { invert } from '../node_modules/gl-matrix/esm/mat4.js';
import { create, transformMat4 } from '../node_modules/gl-matrix/esm/vec3.js';
import '../node_modules/gl-matrix/esm/vec4.js';
import '../node_modules/gl-matrix/esm/quat.js';
import '../node_modules/gl-matrix/esm/vec2.js';
import { menuButton } from './Components/uiComponents/ButtonArgos.js';
import { hoverText } from './Components/uiComponents/TextArgos.js';
import { mainMenuButtons } from './Components/uiComponents/globalVariables.js';
import { initScienceSamplingView, setStep } from './Components/systemComponents/scienceSampling/scienceSampling.js';
import { initTelemetry } from './Components/systemComponents/telemetry/telemetry.js';
import io from '../node_modules/socket.io-client/dist/socket.io.js';

var mainPrism;
var fingerTipPosition = create();
// This boolean variable makes sure that we only hover one button at a time
var isHoverInUse = false;
// The current step we are in the science sampling stage initialized to step 1;
// As the user points their left or right fist, we move down and up a step respectively
var stepCounter = 0;
var scienceSamplingStep = 1;
var scienceSamplingVisible = false;
// TODO: Use ui.Time to get seconds before making another invoke of hover state
// Same idea, I just used sleep instead, it seemed more readable.
// let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// This currently variable helps transition icons from hover state to click state
// If number of times clicked >= 2. Click state is triggered.
var currentClicked = {
  name: '',
  numberOfTimesClicked: 0
};
// Socket io server host address. Remember to update if server is moved to different address
const socket = io.connect('http://172.20.10.2:3000', { reconnect: true });
socket.on('con', data => {
  console.log(data);
});
class Keypoint {
  constructor (a_model, a_pos) {
    this.model = a_model;
    this.worldPos = a_pos;
  }
}

class Hand {
  constructor () {
    this.gesture = input.GestureType.NONE;
    this.confidence = 1.0;
    this.timer = 1.0;
    this.keypointMap = {};
  }
}

class App extends ImmersiveApp {
  init () {
    console.log('started');
    // Request Privilege for Local Area Network Communication
    // this.requestPrivilege(PrivilegeId.kLocalAreaNetwork);
    let prism = this.requestNewPrism([6.0, 6.0, 6.0], PrismType.kCamera);
    this.selectPrism(prism, true);

    prism.loadResourceModel('res/Resources.xml');
    this.objName = prism.loadObjectModel('res/Objects.xml');

    ui.Cursor.SetPlaneDepth(prism, -1.0);
    ui.Cursor.SetScale(prism, 0.0);
    // We are setting the cursor to false because we don't want to pick up signals from the remote
    // if (ui.Cursor.IsEnabled()) {
    //   ui.Cursor.SetEnabled(prism, false);
    // }

    this.trackedGestures = HandGestureFlags.kHandC.value | HandGestureFlags.kHandFinger.value | HandGestureFlags.kHandFist.value |
                           HandGestureFlags.kHandPinch.value | HandGestureFlags.kHandThumb.value | HandGestureFlags.kHandL.value |
                           HandGestureFlags.kHandOpenHandBack.value | HandGestureFlags.kHandOk.value | HandGestureFlags.kHandNoPose.value;

    prism.startTrackHandGesture(this.trackedGestures);
    this.prism = prism;
    this.createUiGrid();
    this.uiCreateMainMenuPrism();

    this.rightHand = new Hand();

    this.leftHand = new Hand();

    this.updateLeftText();
    this.updateRightText();
    // This part is just a test connection with octavia
    // socket.on('con', data => {
    //   console.log(data);
    //   socket.emit('initialTelemetryReceived');
    //   socket.on('updateTelemetry', function updateTelemetry () {
    //     console.log('updating telemetry...');
    //   });
    // });
    return 0;
  }
  uiCreateMainMenuPrism () {
    // Use PrismType.kCamera for headLocked Content
    mainPrism = ui.UiGridLayout.Create(this.prism);
    mainPrism.setName('mainMenu');
    // mainPrism = this.prism;
    console.log('i was here');
    for (var btn in mainMenuButtons) {
      var prop = mainMenuButtons[btn];
      // Creating all menu buttons referencing their properties from the globalVariables.js file
      let button = menuButton(this.prism, prop.normalIcon);
      button.setLocalPosition([prop.x, prop.y, prop.z]);
      button.setName(prop.name);
      mainPrism.addChild(button);
      // Creating the hover state of those icons as well
      let buttonHover = menuButton(this.prism, prop.hoverIcon);
      buttonHover.setVisible(false);
      buttonHover.setLocalPosition([prop.x, prop.y, -0.9]);
      buttonHover.setName(prop.hoverName);
      mainPrism.addChild(buttonHover);
      // Creating the text for the Hover state
      let text = hoverText(this.prism, prop.displayName);
      text.setVisible(false);
      text.setLocalPosition([prop.x - 0.06, prop.y - 0.105, -0.9]);
      text.setName(prop.displayName);
      mainPrism.addChild(text);
      this.prism.getRootNode().addChild(mainPrism);
    }
    //  TODO: Remove the next two lines in production
    initScienceSamplingView(this.prism, mainPrism);
    scienceSamplingVisible = true;
    // TODO: remember to remove null for telemetry
    initTelemetry(this.prism);
  }

  updateLoop (delta) {
    if (this.leftHand.gesture !== input.GestureType.NONE) {
      this.leftHand.timer -= delta;
      if (this.leftHand.timer <= 0.0) ; else {
        this.updateLeftKeypointPositions();
      }
    }

    if (this.rightHand.gesture !== input.GestureType.NONE) {
      this.rightHand.timer -= delta;
      if (this.rightHand.timer <= 0.0) ; else {
        this.updateRightKeypointPositions();
      }
    }

    return true;
  }
  eventListener (event) {
    if (event instanceof GestureInputEventData) {
      let gestureType = event.getGesture();
      let index = event.getHandGestureIndex();
      let confidence = event.getHandGestureConfidence();
      // let gestureEventData = event.getHandGestureKeypoint();
      if (index === 1) {
        this.resolveRightHandGesture(gestureType, confidence, event);
        this.updateRightKeypoints(event);
      } else if (index === 0) {
        this.resolveLeftHandGesture(gestureType, confidence, event);
        this.updateLeftKeypoints(event);
      }
    }
    return false;
  }

  getLocalFingerTipPosition () {
    // Because of Lumin Runtime's coordinate system. Hand tracking data is in world space,
    // while the transforms inside our prism will be in prism space. So, we need to do a projection.
    let transform = this.getPrismTransform(this.prism);
    let inverse = invert([], transform);
    // Geting the actual vector position
    // handPosition = inverse * vec4(handPosition, 1.0);
    fingerTipPosition = inverse * transformMat4(fingerTipPosition);
    // handPosition = inverse * vec3.transformMat4(handPosition, 1.0);
    return fingerTipPosition;
  }
  // This method handles the hover state for icons
  invokeHoverState (localFingerTipPosition) {
    // Get x, y and z coordinates of the vector
    var x = localFingerTipPosition[0];
    var y = localFingerTipPosition[1];
    // var z = localFingerTipPosition[2];
    // Then we define the tolerance distance of invoking hover.
    // In future, if buttons are spaced out, just change the tolerance
    var xTolerance = 0.05;
    var yTolerance = 0.05;
    var xUpperBound, xLowerBound;
    var yUpperBound, yLowerBound;

    xLowerBound = x - xTolerance;
    xUpperBound = x + xTolerance;
    yUpperBound = y + yTolerance;
    yLowerBound = y - yTolerance;

    // For all the buttons, if x coordinate bound is within x upper bound and y...
    // Invoke that variable's hover state
    for (var btn in mainMenuButtons) {
      var button = mainMenuButtons[btn];
      if (button.x >= xLowerBound && button.x <= xUpperBound &&
        button.y >= yLowerBound && button.y <= yUpperBound && !isHoverInUse) {
        // Then user's finger position is within the area of this button.
        var name = button.name;
        isHoverInUse = true;
        console.log(name + 'is hovered over' + ' Hover position: ' + localFingerTipPosition[0]);
        var menuBtn = this.prism.getRootNode().findChild(button.name);
        var hoverBtn = this.prism.getRootNode().findChild(button.hoverName);
        var text = this.prism.getRootNode().findChild(button.displayName);
        var currentSize = menuBtn.getIconSize();
        // var currentPosition = menuBtn.getLocalPosition();
        menuBtn.setVisible(false);
        // menuBtn.setIconSize([0.13, 0.13]);
        // menuBtn.setLocalPosition([button.x, button.y, -0.93]);

        // Apply hover state by making the hover state icon visible
        hoverBtn.setIconSize([currentSize[0] * 1.25, currentSize[1] * 1.25]);
        hoverBtn.setVisible(true);
        if (name !== 'homeBtn') {
          text.setVisible(true);
        }
        // Update currentClicked object
        if (currentClicked.name !== name) {
          // console.log('NAME NOT MATCHED');
          currentClicked.name = name;
          currentClicked.numberOfTimesClicked = 1;
        } else if (currentClicked.name === name) {
          // console.log('NAME MATCHED');
          currentClicked.numberOfTimesClicked++;
        }
        // Set timer to log out of hover state
        setTimeout(() => {
          // Remove Hover state
          // menuBtn.setIconSize([currentSize[0], currentSize[1]]);
          // menuBtn.setLocalPosition([currentPosition[0], currentPosition[1], -1]);
          hoverBtn.setVisible(false);
          text.setVisible(false);
          hoverBtn.setIconSize([currentSize[0], currentSize[1]]);
          fingerTipPosition = create();
          menuBtn.setVisible(true);
          isHoverInUse = false;
          // console.log('I finished hover ' + currentClicked.name + ' : ' + currentClicked.numberOfTimesClicked);
          // console.log('Button Name: ' + name);
          if (currentClicked.name === name && currentClicked.numberOfTimesClicked >= 2) {
            console.log(name + ' : is clicked NOW');
            // Trigger click state for button with this name.
            this.triggerClickState(name);
          }
        }, 2000);
        // setInterval(async () => {
        //   // Remove Hover state
        //   menuBtn.setIconSize([currentSize[0], currentSize[1]]);
        //   menuBtn.setLocalPosition([currentPosition[0], currentPosition[1], -1]);
        //   await sleep(5000);
        //   // Set hover to not in use
        //   // Reset Finger Tip Position
        //   fingerTipPosition = vec3.create();
        //   isHoverInUse = false;
        // }, 3000);
        // menuBtn.setIconColor([24, 41, 69, 1]);
      }
    }
  }
  triggerClickState (name) {
    switch (name) {
      case 'scienceBtn':
        // Call the function for science button clicked.
        initScienceSamplingView(this.prism, mainPrism);
        scienceSamplingVisible = true;
        break;
    }
  }

  resolveRightHandGesture (gestureType, confidence, event) {
    // If gesture type is not null
    if (gestureType !== input.GestureType.NONE && event !== null) {
      console.log('Gesture detected on the right hand');
      // If the gesture detected is a pointed finger
      if (gestureType === input.GestureType.HAND_FINGER) {
        // We want to get the vector position of that finger in the view
        // We may wanna have a bool variable here to toggle between other gestures too (Future)
        fingerTipPosition = event.getHandGestureKeypoint(input.HandGestureKeypointName.INDEX_FINGER_TIP);
        // console.log('Pointed finger gesture detected on Right hand');
        // console.log('Before Projection' + fingerTipPosition.toString());
        // Because of Lumin Runtime's coordinate system. Hand tracking data is in world space,
        // while the transforms inside our prism will be in prism space. So, we need to do a projection.
        let transform = this.getPrismTransform(this.prism);
        let inverse = invert([], transform);
        // Geting the actual vector position relative to our prism size
        let localFingerTipPos = transformMat4([], fingerTipPosition, inverse);
        // console.log('After Projection' + localFingerTipPos.toString());
        this.invokeHoverState(localFingerTipPos);
        this.rightHand.gesture = gestureType;
      } else if (gestureType === input.GestureType.HAND_FIST) {
        console.log('RIGHT FIST DETECTED');
        // Increment the science sampling step and call the change step state function
        if (scienceSamplingVisible === true && stepCounter >= 0 && stepCounter <= 700) {
          // There are at most 7 steps we don't want to go out of bounds
          stepCounter = stepCounter + 1;
          scienceSamplingStep = Math.floor(stepCounter / 100 * 1.5);
          console.log('STEP: ' + scienceSamplingStep);
          setStep(scienceSamplingStep, this.prism);
        }
      }

      // set the new gesture and confidence
      this.rightHand.gesture = gestureType;
      this.rightHand.confidence = confidence;
      this.rightHand.timer = 1.0;

      // this.updateRightText();
    }
    // else {
    //   // console.log('No hand detected');
    //   // There's a button on hover state, remove hover state
    // }
  }

  resolveLeftHandGesture (gestureType, confidence, event) {
    if (gestureType !== input.GestureType.NONE) {
      console.log('Gesture detected on the left hand');
      if (gestureType === input.GestureType.HAND_FINGER) {
        fingerTipPosition = event.getHandGestureKeypoint(input.HandGestureKeypointName.INDEX_FINGER_TIP);
        let transform = this.getPrismTransform(this.prism);
        let inverse = invert([], transform);
        let localFingerTipPos = transformMat4([], fingerTipPosition, inverse);
        this.invokeHoverState(localFingerTipPos);
        this.rightHand.gesture = gestureType;
      } else if (gestureType === input.GestureType.HAND_FIST) {
        console.log('LEFT FIST DETECTED');
        // Increment the science sampling step and call the change step state function
        if (scienceSamplingVisible === true && stepCounter >= 0 && stepCounter <= 700) {
          // There are at most 7 steps we don't want to go out of bounds
          stepCounter = stepCounter - 1;
          scienceSamplingStep = Math.floor(stepCounter / 100 * 1.5);
          console.log('STEP: ' + scienceSamplingStep);
          setStep(scienceSamplingStep, this.prism);
        }
      }
      this.leftHand.gesture = gestureType;
      this.leftHand.confidence = confidence;
      this.leftHand.timer = 1.0;
    }
  }

  updateLeftKeypoints (event) {
    for (var i = input.HandGestureKeypointName.NONE.value; i <= input.HandGestureKeypointName.WRIST_THUMB_SIDE.value; ++i) {
      let keypointName = input.HandGestureKeypointName(i);
      let pos = event.getHandGestureKeypoint(keypointName);
      if (keypointName in this.leftHand.keypointMap) {
        this.leftHand.keypointMap[keypointName].worldPos = pos;
      } else {
        let key = new Keypoint(this.prism.createNode(this.objName, 'Sphere'), pos);
        this.prism.getRootNode().addChild(key.model);
        this.leftHand.keypointMap[keypointName] = key;
      }
    }
  }

  updateRightKeypoints (event) {
    for (var i = input.HandGestureKeypointName.NONE.value; i <= input.HandGestureKeypointName.WRIST_THUMB_SIDE.value; ++i) {
      let keypointName = input.HandGestureKeypointName(i);
      let pos = event.getHandGestureKeypoint(keypointName);
      if (keypointName in this.rightHand.keypointMap) {
        this.rightHand.keypointMap[keypointName].worldPos = pos;
      } else {
        let key = new Keypoint(this.prism.createNode(this.objName, 'Sphere'), pos);
        this.prism.getRootNode().addChild(key.model);
        this.rightHand.keypointMap[keypointName] = key;
      }
    }
  }

  updateLeftKeypointPositions () {
    // debugger;
    let transform = this.getPrismTransform(this.prism);
    let inverse = invert([], transform);

    for (var k in this.leftHand.keypointMap) {
      let localPos = transformMat4([], this.leftHand.keypointMap[k].worldPos, inverse);
      this.leftHand.keypointMap[k].model.setLocalPosition(localPos);
    }
  }

  updateRightKeypointPositions () {
    // debugger;
    let transform = this.getPrismTransform(this.prism);
    let inverse = invert([], transform);

    for (var k in this.rightHand.keypointMap) {
      let localPos = transformMat4([], this.rightHand.keypointMap[k].worldPos, inverse);
      this.rightHand.keypointMap[k].model.setLocalPosition(localPos);
    }
  }

  createUiGrid () {
    this.gestureMap = {};

    let grid = ui.UiGridLayout.Create(this.prism);
    grid.setColumns(4);
    grid.setRows(2);
    grid.setAlignment(ui.Alignment.CENTER_CENTER);
    grid.addItem(this.createUiImage('res/Gesture_C.png', input.GestureType.HAND_C));
    grid.addItem(this.createUiImage('res/Gesture_Finger.png', input.GestureType.HAND_FINGER));
    grid.addItem(this.createUiImage('res/Gesture_Fist.png', input.GestureType.HAND_FIST));
    grid.addItem(this.createUiImage('res/Gesture_L.png', input.GestureType.HAND_L));
    grid.addItem(this.createUiImage('res/Gesture_Ok.png', input.GestureType.HAND_OK));
    grid.addItem(this.createUiImage('res/Gesture_OpenHand.png', input.GestureType.HAND_OPENHANDBACK));
    grid.addItem(this.createUiImage('res/Gesture_Pinch.png', input.GestureType.HAND_PINCH));
    grid.addItem(this.createUiImage('res/Gesture_Thumb.png', input.GestureType.HAND_THUMB));
    grid.setLocalPosition([0.0, 0.0, -1.0]);
    // This line is v. important for now, otherwise the green lines disappear
    grid.setVisible(false);
    this.prism.getRootNode().addChild(grid);

    let linear = ui.UiLinearLayout.Create(this.prism);
    linear.setAlignment(ui.Alignment.CENTER_LEFT);
    linear.setDefaultItemPadding([0.01, 0.01, 0.01, 0.01]);
    this.leftText = ui.UiText.Create(this.prism, '');
    this.rightText = ui.UiText.Create(this.prism, '');
    linear.addItem(this.rightText);
    linear.addItem(this.leftText);
    grid.addChild(linear);
    linear.setLocalPosition([-0.2, 0.15, 0.0]);
  }
  createUiImage (filepath, gesture) {
    let image = ui.UiImage.Create(this.prism, filepath, 0.1, 0.1);
    let imageObject = {
      uiImage: image,
      defaultColor: color.WHITE,
      active: true
    };

    image.onActivateSub(evt => {
      let flag = this.gestureToFlag(gesture);
      this.prism.stopTrackHandGesture(this.trackedGestures);
      this.trackedGestures ^= flag;
      this.prism.startTrackHandGesture(this.trackedGestures);
      this.gestureMap[gesture].active = !(this.gestureMap[gesture].active);
      if (this.gestureMap[gesture].active) {
        this.gestureMap[gesture].defaultColor = color.WHITE;
      } else {
        this.gestureMap[gesture].defaultColor = [0.5, 0.5, 0.5, 1.0];
      }
      this.gestureMap[gesture].uiImage.setColor(this.gestureMap[gesture].defaultColor);
    });
    this.gestureMap[gesture] = imageObject;
    return image;
  }

  gestureToString (gesture) {
    switch (gesture) {
      case input.GestureType.HAND_C:
        return 'HAND_C';
      case input.GestureType.HAND_FINGER:
        return 'HAND_FINGER';
      case input.GestureType.HAND_FIST:
        return 'HAND_FIST';
      case input.GestureType.HAND_L:
        return 'HAND_L';
      case input.GestureType.HAND_OK:
        return 'HAND_OK';
      case input.GestureType.HAND_OPENHANDBACK:
        return 'HAND_OPENHANDBACK';
      case input.GestureType.HAND_PINCH:
        return 'HAND_PINCH';
      case input.GestureType.HAND_THUMB:
        return 'HAND_THUMB';
      case input.GestureType.HAND_NO_POSE:
        return 'HAND_NO_POSE';
      default:
        return 'NONE';
    }
  }

  gestureToFlag (gesture) {
    switch (gesture) {
      case input.GestureType.HAND_C:
        return HandGestureFlags.kHandC.value;
      case input.GestureType.HAND_FINGER:
        return HandGestureFlags.kHandFinger.value;
      case input.GestureType.HAND_FIST:
        return HandGestureFlags.kHandFist.value;
      case input.GestureType.HAND_L:
        return HandGestureFlags.kHandL.value;
      case input.GestureType.HAND_OK:
        return HandGestureFlags.kHandOk.value;
      case input.GestureType.HAND_OPENHANDBACK:
        return HandGestureFlags.kHandOpenHandBack.value;
      case input.GestureType.HAND_PINCH:
        return HandGestureFlags.kHandPinch.value;
      case input.GestureType.HAND_THUMB:
        return HandGestureFlags.kHandThumb.value;
      default:
        return 0;
    }
  }
}

export { App };
