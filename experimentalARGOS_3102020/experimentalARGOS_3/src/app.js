/*
  Hello from the past.

  This is Bill, and I am very sorry for the code you are about to see.

  It had to be this way.

  Lets do this together

///////////////////////////////////////THE BEGINNING////////////////////////////////////////////////////////////

*/
/* 
  Make sure to import classes you you want to use. 
  If you dont import something like "ui" for example then you cannot
  use functions like .UiText
  
  Be careful with this, this can trip you up.
  
*/
import {
  ImmersiveApp,
  ui,
  PrismType,
  input,
  color,
  HandGestureFlags,
} from 'lumin';

import {
  GestureInputEventData
} from 'lumin';

import {
  mat4,
  vec3
} from 'gl-matrix';


/*
  Constructors for keypoint and Hand Classes
  Init variables used for updating hands
*/
class Keypoint {
  constructor(a_model, a_pos) {
    this.model = a_model;
    this.worldPos = a_pos;
  }
}

class Hand {
  constructor() {
    this.gesture = input.GestureType.NONE;
    this.confidence = 1.0;
    this.timer = 1.0;
    this.keypointMap = {};
  }
}

//Alright this next spot aint great...
//These are all the public varibles used between methods
//There has to be a better way...
var unlockedPrismSpawn = true;
var prism;
var unlockedPrism;
var newunlockedPrism;
var headLocked = PrismType.kWorld;
var posx = 0;
var px = 0;
var leftPanelIndex;
var InstructionsPanel;
var leftPanelPage = 0;
var leftPanelCounter = 0;
var InstructionsHeader;
var InstructionsBody;
var stepTracker;
var pageImage2, pageImage3, pageImage4, pageImage5, pageImage6, pageImage7;
var animationIcon, toolkitIcon, recordIcon, cameraIcon, animationIconHovered, toolkitIconHovered, recordIconHovered, cameraIconHovered, cameraScreen;
var ToolkitPanel, CameraScreenPanel;
var pinchCounter = 0;
var roverNode;
var newPrism;
var newGrid;
var newestGrid;

/* 
  This is where the App starts 
  Extends ImmersiveApp, whenever you see: this.something
  the app is reading that as ImmersiveApp.somthing (ex:this.prism)
*/
export class App extends ImmersiveApp {
  //init is where we instantiate all the elements of our app
  init() {
    //set the left instruction panel to page 0, 
    leftPanelIndex = 0;
    //calling methods to instantiate methods

    //creates the prism... see more in method
    this.makeAPrism();
    //makes a second prism
    this.makeANewPrism();

    //an array holding the numeric value of each gesture flag
    this.trackedGestures = HandGestureFlags.kHandC.value | HandGestureFlags.kHandFinger.value | HandGestureFlags.kHandFist.value |
      HandGestureFlags.kHandPinch.value | HandGestureFlags.kHandThumb.value | HandGestureFlags.kHandL.value |
      HandGestureFlags.kHandOpenHandBack.value | HandGestureFlags.kHandOk.value | HandGestureFlags.kHandNoPose.value;

    //running method within the prism object
    prism.startTrackHandGesture(this.trackedGestures);

    //Setting the prism property of Immersive App = to the prism created in makeAPrism();
    this.prism = prism;

    this.createUiGrid();

    //creating each hand that is going to be tracked
    this.rightHand = new Hand();
    this.leftHand = new Hand();

    //no clue if this is used, might be able to be removed
    this.someHelp = new UiElement();
    //creates text objects
    this.updateLeftText();
    this.updateRightText();

    
    return 0;
  }

  //This is is where we create the prism that is going to become the Main prism of the app 
  //The prism is the render space of the application, 
  //Ui elements are all created within a prim
  makeAPrism() {

    //setting the prism var to the response of this method
    //ImmersiveApp.requestNewPrism([Vector 3],[Prism.Type]);
    prism = this.requestNewPrism([3.0, 3.0, 3.0], PrismType.kCamera);

    //I think this Makes this the prism you are interacting with, double check
    this.selectPrism(prism, true);

    //load the xml files to be accessible by this prism
    prism.loadResourceModel('res/Resources.xml');

    //creating the spheres
    this.objName = prism.loadObjectModel('res/Objects.xml');
  }

  //This is where we make the second, unlocked prism
  makeANewPrism() {
    //creating the unlockedPrism
    unlockedPrism = this.requestNewPrism([3.0, 3.0, 3.0], headLocked);
    unlockedPrism.loadResourceModel('res/Resources.xml');

    //This is is what Spawns the unlocked prism in frame
    this.positionPrismRelativeToCamera(unlockedPrism, [0.0, 0.0, 0.0]);
    this.orientPrismRelativeToCamera(unlockedPrism, [0, 0, 0, 0]);
  }

    //just and example of how to make a third prism
    //not used
  makeANewestPrism() {
    newunlockedPrism = this.requestNewPrism([3.0, 3.0, 3.0], headLocked);

    newunlockedPrism.loadResourceModel('res/Resources.xml');
  }

  //Update Loop, runs the code 30/sec I think?
  updateLoop(delta) {
    //tracking hands
    if (this.leftHand.gesture != input.GestureType.NONE) {
      this.leftHand.timer -= delta;
      if (this.leftHand.timer <= 0.0) {
        this.resolveLeftHandGesture(input.GestureType.NONE, 1.0);
      } else {
        this.updateLeftKeypointPositions();
      }
    }

    if (this.rightHand.gesture != input.GestureType.NONE) {
      this.rightHand.timer -= delta;
      if (this.rightHand.timer <= 0.0) {
        this.resolveRightHandGesture(input.GestureType.NONE, 1.0);
      } else {
        this.updateRightKeypointPositions();
      }
    }

    return true;
  }

  //event listener
  eventListener(event) {
    console.log('listening');
    //if there is a gesture input event
    if (event instanceof GestureInputEventData) {
      console.log('gesture found');
      //instantiating 
      let gestureType = event.getGesture();
      let index = event.getHandGestureIndex();
      // deviceData = event.getHandGestureLocation();
      let confidence = event.getHandGestureConfidence();
      console.log('Index');
      if (index == 1) {
        console.log('right gesture found');
        this.resolveRightHandGesture(gestureType, confidence);
        this.updateRightKeypoints(event);
      } else if (index == 0) {
        console.log('left gesture found');
        this.resolveLeftHandGesture(gestureType, confidence);
        this.updateLeftKeypoints(event);
      }
    }
    return true;
  }

  //Deciding what hand gesture is being made
  resolveRightHandGesture(gestureType, confidence) {
    console.log('resolve right hand');
    // right hand was forming another gesture previously, undo right hand color
    if (this.rightHand.gesture in this.gestureMap) {
      // left hand is forming the gesture so revert back to left hand color
      if (this.leftHand.gesture == this.rightHand.gesture) {
        this.colorLeftHand();
      }
      // no hand is doing the gesture so revert back to default color
      else {
        this.gestureMap[this.rightHand.gesture].uiImage.setColor(this.gestureMap[this.rightHand.gesture].defaultColor);
      }
    }

    // set the new gesture and confidence
    this.rightHand.gesture = gestureType;
    this.rightHand.confidence = confidence;
    this.rightHand.timer = 1.0;

    // new gesture is one that we recognize
    if (gestureType in this.gestureMap) {
      // left hand is forming the gesture so color it for both hands
      if (this.rightHand.gesture == this.leftHand.gesture) {
        this.colorBothHands();
      }
      // only right hand is forming the gesture so color it for right hand
      else {
        this.colorRightHand();
      }
    }
    this.updateRightText();
  }

  resolveLeftHandGesture(gestureType, confidence) {
    console.log('reolve left hand');
    // left hand was forming another gesture, undo left hand color
    if (this.leftHand.gesture in this.gestureMap) {
      // right hand is forming the gesture, revert back to right hand color
      if (this.leftHand.gesture == this.rightHand.gesture) {
        this.colorRightHand();
      }
      // no hand is foming the gesture, revert to default color
      else {
        this.gestureMap[this.leftHand.gesture].uiImage.setColor(this.gestureMap[this.leftHand.gesture].defaultColor);
      }
    }

    // set the new gesture and confidence
    this.leftHand.gesture = gestureType;
    this.leftHand.confidence = confidence;
    this.leftHand.timer = 1.0;

    // new gesture is one that we recognize
    if (gestureType in this.gestureMap) {
      // right hand is also forming the gesture, color for both hands
      if (this.rightHand.gesture == this.leftHand.gesture) {
        this.colorBothHands();
      }
      // only left hand is forming gesture, color for left hand
      else {
        this.colorLeftHand();
      }
    }
    //updating 
    this.updateLeftText();
  }
  //change the cooler of 
  colorLeftHand() {
    this.gestureMap[this.leftHand.gesture].uiImage.setColor(color.BLUE);
  }
  //sames
  colorRightHand() {
    this.gestureMap[this.rightHand.gesture].uiImage.setColor(color.RED);
  }

  colorBothHands() {
    this.gestureMap[this.rightHand.gesture].uiImage.setColor([1.0, 0.0, 1.0, 1.0]);
  }

  //updating the text
  updateLeftText() {
    let text = 'Left Hand (Blue) - Gesture: ' + this.gestureToString(this.leftHand.gesture) + ' Confidence: ' + this.leftHand.confidence.toFixed(3);
    if (this.gestureToString(this.leftHand.gesture) === 'HAND_OK') {

    }

    this.leftText.setText(text);
  }

  updateRightText() {
    let text = 'Right Hand (Red) - Gesture: ' + this.gestureToString(this.rightHand.gesture) + ' Confidence: ' + this.rightHand.confidence.toFixed(3);
    this.rightText.setText(text);
  }

  /*
  updating them dots on yem hands
  */
  updateLeftKeypoints(event) {
    for (var i = input.HandGestureKeypointName.NONE.value; i <= input.HandGestureKeypointName.WRIST_THUMB_SIDE.value; ++i) {
      let keypointName = input.HandGestureKeypointName(i);
      let pos = event.getHandGestureKeypoint(keypointName);

      if (this.gestureToString(this.leftHand.gesture) === 'HAND_OK') {
        //So if you doing a Okay then we going to run stuff
      }
      //if gesturing then
      if (this.gestureToString(this.leftHand.gesture) === 'HAND_PINCH') {

        if (pinchCounter === 3000) {
          this.selectPrism(newPrism, true);
          newestGrid = ui.UiLinearLayout.Create(newPrism);
          newestGrid.setLocalPosition([0.0, 0.0, -0.05]);
          newPrism.getRootNode().addChild(newestGrid);

          newestGrid.addChild(this.createToolboxPanel());

          pinchCounter++;
        } else if (pinchCounter < 3000) {
          pinchCounter++;
        }
      }
      

      if (this.gestureToString(this.leftHand.gesture) === 'HAND_FIST') {
        //Fist will page the left, on a timer
        if (leftPanelCounter >= 2000) {
          if (leftPanelPage > 0 && leftPanelPage <= 7) {
            leftPanelPage--;
          } else if (leftPanelPage > 7) {

          }
          leftPanelCounter = 0;
        }
        leftPanelCounter++;
      } else {
        leftPanelCounter = 0;
      }
      //Show certain elements based on page
      if (leftPanelPage === 1) {

        if (InstructionsPanel.isVisible() === true) {
          ToolkitPanel.setVisible(true);
        }
        InstructionsHeader.setText('GATHER EQUIPMENT');
        InstructionsBody.setText('Put the tools into your carrier bag.\n Confirm that all necessary \nequipment are in the bag: \n1. Tongs \n2. Rake \n3. Container');
        InstructionsPanel.removeChild(pageImage2);
        InstructionsPanel.addChild(stepTracker);
      } else if (leftPanelPage === 2) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('LOCATE SAMPLE AREA');
        InstructionsBody.setText('Once you have all of the \nequipment in the bag,\n head to the sample site');
        InstructionsPanel.removeChild(pageImage3);
        InstructionsPanel.addChild(pageImage2);
      } else if (leftPanelPage === 3) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('CLEAR SAMPLE');
        InstructionsBody.setText('Use the rake to sift through \nthe terrain and clear extra \nresidue obstructing the sample.');
        InstructionsBody.setLocalPosition([-0.015, -0.225, 0.05]);
        InstructionsPanel.removeChild(pageImage4);
        InstructionsPanel.addChild(pageImage3);
      } else if (leftPanelPage === 4) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('PICK UP SAMPLE');
        InstructionsBody.setText('\n \n \nTake the tongs and squeeze\n the handle to clamp\n the pincers. Use this tool\n to pick up the sample\n \n In the next step, ARGOS\nwill begin recording audio \nfor your field notes');
        InstructionsBody.setLocalPosition([-0.015, -0.25, 0.05]);
        InstructionsPanel.removeChild(pageImage5);
        InstructionsPanel.addChild(pageImage4);
      } else if (leftPanelPage === 5) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('FIELD NOTES');
        InstructionsBody.setText("Record a description of the rock.\n Be sure to state:\n1.Approximation of Size\n2.Color/Patterns\n3.Texture \n To start recording say: \n'Hey Lumin, record video'. \nTo stop recording, say:\n'Hey Lumin, stop recording'");
        InstructionsBody.setLocalPosition([-0.015, -0.275, 0.05]);
        InstructionsPanel.removeChild(pageImage6);
        InstructionsPanel.addChild(pageImage5);
      } else if (leftPanelPage === 6) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('TAKE A PHOTO');
        InstructionsBody.setText("Use the camera function to\n take a photo of the sample. \n To take a photo, say:\n 'Hey Lumin, take a photo'.");

        InstructionsPanel.addChild(pageImage6);
        InstructionsPanel.removeChild(pageImage7);
      } else if (leftPanelPage >= 7) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('STORE SAMPLE');
        InstructionsBody.setText('Twist the lid on the container\n to seal the sample. \nPlace the sample into the bag.\n \nYou have completed rock sample \ncollection.');
        InstructionsPanel.removeChild(pageImage6);
        InstructionsPanel.addChild(pageImage7);
      }


      if (this.gestureToString(this.leftHand.gesture) === 'HAND_L') {
        headLocked = PrismType.kWorld;
      }

      if (this.gestureToString(this.leftHand.gesture) === 'HAND_FINGER') {

      }

      if (this.gestureToString(this.leftHand.gesture) === 'HAND_THUMB') {
        console.log('thumb, left hand');
        if (unlockedPrismSpawn) {
          this.makeANewPrism();
          this.createnewGrid();
        }
        unlockedPrismSpawn = false;
      }

      if (keypointName in this.leftHand.keypointMap) {
        this.leftHand.keypointMap[keypointName].worldPos = pos;
      } else {
        let key = new Keypoint(this.prism.createNode(this.objName, 'Sphere'), pos);
        this.prism.getRootNode().addChild(key.model);
        this.leftHand.keypointMap[keypointName] = key;
      }
    }
  }

  timer() {
    let counter = 0;
    for (var j = 0; j < 30; j++) {
      counter = j;
    }
    return counter;
  }

  //Updates the point on the right hand
  updateRightKeypoints(event) {
    for (var i = input.HandGestureKeypointName.NONE.value; i <= input.HandGestureKeypointName.WRIST_THUMB_SIDE.value; ++i) {
      let keypointName = input.HandGestureKeypointName(i);
      let pos = event.getHandGestureKeypoint(keypointName);

      if (this.gestureToString(this.rightHand.gesture) === 'HAND_THUMB') {
        console.log("thumb");
        newGrid.setVisible(false);
        //visi = true;
        if (leftPanelIndex === 0) {

          ToolkitPanel.setVisible(false);
          setTimeout(() => {
            leftPanelIndex = 1;
          }, 2000);
          return;
        } else if (leftPanelIndex === 2) {

          ToolkitPanel.setVisible(false);
          setTimeout(() => {
            leftPanelIndex = 1;
          }, 2000);
          return;
        } else if (leftPanelIndex === 1) {
          InstructionsPanel.setVisible(true);
          setTimeout(() => {
            leftPanelIndex = 2;
          }, 2000);
          return;
        }
      }

      if (this.gestureToString(this.rightHand.gesture) === 'HAND_FIST') {
        console.log("fist");
        if (leftPanelCounter >= 2000) {
          if (leftPanelPage < 7) {
            leftPanelPage++;
          } else {
            leftPanelPage = 7;
          }
          leftPanelCounter = 0;
        }
        leftPanelCounter++;
      } else {
        leftPanelCounter = 0;
      }

      if (leftPanelPage === 1) {

        ToolkitPanel.setVisible(true);
        InstructionsHeader.setText('GATHER EQUIPMENT');
        InstructionsBody.setText('Put the tools into your carrier bag.\n Confirm that all necessary \nequipment are in the bag: \n1. Tongs \n2. Rake \n3. Container');
      } else if (leftPanelPage === 2) {
        ToolkitPanel.setVisible(false);
        InstructionsHeader.setText('LOCATE SAMPLE AREA');
        InstructionsBody.setText('Once you have all of the \nequipment in the bag,\n head to the sample site');
        InstructionsPanel.removeChild(stepTracker);
        InstructionsPanel.addChild(pageImage2);
      } else if (leftPanelPage === 3) {
        InstructionsHeader.setText('CLEAR SAMPLE');
        InstructionsBody.setText('Use the rake to sift through \nthe terrain and clear extra \nresidue obstructing the sample.');
        InstructionsPanel.removeChild(pageImage2);
        InstructionsPanel.addChild(pageImage3);
      } else if (leftPanelPage === 4) {
        InstructionsHeader.setText('PICK UP SAMPLE');
        InstructionsBody.setText('\n \n \nTake the tongs and squeeze\n the handle to clamp\n the pincers. Use this tool\n to pick up the sample\n \n In the next step, ARGOS\nwill begin recording audio \nfor your field notes');
        InstructionsBody.setLocalPosition([-0.015, -0.25, 0.05]);
        InstructionsPanel.removeChild(pageImage3);
        InstructionsPanel.addChild(pageImage4);
      } else if (leftPanelPage === 5) {
        InstructionsHeader.setText('FIELD NOTES');
        InstructionsBody.setText("Record a description of the rock.\n Be sure to state:\n1.Approximation of Size\n2.Color/Patterns\n3.Texture \nTo start recording say: \n'Hey Lumin, record video'. \nTo stop recording, say:\n'Hey Lumin, stop recording'");
        InstructionsBody.setLocalPosition([-0.015, -0.275, 0.05]);
        InstructionsPanel.removeChild(pageImage4);
        InstructionsPanel.addChild(pageImage5);
      } else if (leftPanelPage === 6) {
        InstructionsHeader.setText('TAKE A PHOTO');
        InstructionsBody.setText("Use the camera function to\n take a photo of the sample. \n To take a photo, say: \n'Hey Lumin, take a photo'.");
        InstructionsPanel.removeChild(pageImage5);
        InstructionsPanel.addChild(pageImage6);
      } else if (leftPanelPage >= 7) {
        InstructionsHeader.setText('STORE SAMPLE');
        InstructionsBody.setText('Twist the lid on the container\n to seal the sample. \nPlace the sample into the bag.\n \nYou have completed rock sample \ncollection.');
        InstructionsPanel.removeChild(pageImage6);
        InstructionsPanel.addChild(pageImage7);
        leftPanelPage = 7;
      }

      if (this.gestureToString(this.rightHand.gesture) === 'HAND_OK') {
        console.log("okay");
        if (InstructionsPanel.isVisible() === false) {

        }
      }

      if (keypointName in this.rightHand.keypointMap) {
        this.rightHand.keypointMap[keypointName].worldPos = pos;
        // menuPlacePosition = this.rightHand.keypointMap[keypointName].worldPos;
      } else {
        let key = new Keypoint(this.prism.createNode(this.objName, 'Sphere'), pos);
        this.prism.getRootNode().addChild(key.model);
        this.rightHand.keypointMap[keypointName] = key;
      }
    }
  }

  //Places update the placement of spheres on l hand
  updateLeftKeypointPositions() {

    let transform = this.getPrismTransform(this.prism);
    let inverse = mat4.invert([], transform);

    for (var k in this.leftHand.keypointMap) {
      let localPos = vec3.transformMat4([], this.leftHand.keypointMap[k].worldPos, inverse);

      this.leftHand.keypointMap[k].model.setLocalPosition(localPos);

      // menuPlacePosition = this.leftHand.keypointMap[k].model.getLocalPosition();
    }
  }

  //same but right
  updateRightKeypointPositions() {

    let transform = this.getPrismTransform(this.prism);
    let inverse = mat4.invert([], transform);

    for (var k in this.rightHand.keypointMap) {
      let localPos = vec3.transformMat4([], this.rightHand.keypointMap[k].worldPos, inverse);
      this.rightHand.keypointMap[k].model.setLocalPosition(localPos);
    }
  }
  //creates the unlocked content
  createnewGrid() {
    //creating a layout we can add ui elements to, must pass a prism
    newGrid = ui.UiGridLayout.Create(unlockedPrism);
    newGrid.setColumns(4);
    newGrid.setRows(2);
    //setting alighnments and such
    newGrid.setAlignment(ui.Alignment.CENTER_CENTER);
    newGrid.setLocalPosition([0.0, 0.0, -1.0]);
    //adding the grid to thge prism
    unlockedPrism.getRootNode().addChild(newGrid);

    //creating ui elements and 
    let homeNode = ui.UiImage.Create(unlockedPrism, 'res/home.png', 0.1, 0.1);
    homeNode.setLocalPosition([posx, 0.01, -0.1]);

    let scienceSamplingText = ui.UiText.Create(unlockedPrism, 'Science Sampling');
    scienceSamplingText.setLocalPosition([-0.05, 0.07, -0.1]);

    let samplingNode = ui.UiImage.Create(unlockedPrism, 'res/sample.png', 0.1, 0.1);
    samplingNode.setLocalPosition([posx, 0.13, -0.1]);
    samplingNode.setLocalScale([0.8, 0.8, 0.8]);

    let roverRepairText = ui.UiText.Create(unlockedPrism, 'Rover Repair');
    roverRepairText.setLocalPosition([posx + 0.085, -0.025, -0.1]);

    //Passing the path of the resouce you are looking for
    roverNode = ui.UiImage.Create(unlockedPrism, 'res/rover.png', 0.1, 0.1);
    roverNode.setLocalPosition([posx + 0.12, 0.04, -0.1]);
    roverNode.setLocalScale([0.8, 0.8, 0.8]);

    let explorationText = ui.UiText.Create(unlockedPrism, 'Exploration');
    explorationText.setLocalPosition([posx + 0.05, -0.15, -0.1]);


    let explorationNode = ui.UiImage.Create(unlockedPrism, 'res/exploration.png', 0.1, 0.1);
    explorationNode.setLocalPosition([posx + 0.085, -0.085, -0.1]);
    explorationNode.setLocalScale([0.8, 0.8, 0.8]);

    let destinationText = ui.UiText.Create(unlockedPrism, 'Destination');
    destinationText.setLocalPosition([posx - 0.12, -0.15, -0.1]);


    let destinationNode = ui.UiImage.Create(unlockedPrism, 'res/nav.png', 0.1, 0.1);
    destinationNode.setLocalPosition([posx - 0.085, -0.085, -0.1]);
    destinationNode.setLocalScale([0.8, 0.8, 0.8]);

    let toolBoxText = ui.UiText.Create(unlockedPrism, 'Tool Box');
    toolBoxText.setLocalPosition([posx + -0.145, -0.025, -0.1]);

    let toolNode = ui.UiImage.Create(unlockedPrism, 'res/tool.png', 0.1, 0.1);
    toolNode.setLocalPosition([posx - 0.12, 0.04, -0.1]);
    toolNode.setLocalScale([0.8, 0.8, 0.8]);

    //Adding all the items to the grid as a child which itself is a child of the prism
    newGrid.addChild(scienceSamplingText);
    newGrid.addChild(roverRepairText);
    newGrid.addChild(explorationText);
    newGrid.addChild(destinationText);
    newGrid.addChild(toolBoxText);
    newGrid.addChild(homeNode);
    newGrid.addChild(samplingNode);
    newGrid.addChild(roverNode);
    newGrid.addChild(explorationNode);
    newGrid.addChild(destinationNode);
    newGrid.addChild(toolNode);

    //return that grid
    return newGrid;
  }


  createListViewItem() {
    let UIListNode = ui.UiListViewItem.Create(unlockedPrism);
    UIListNode.setBackgroundColor(1, 1, 1, 1);
    unlockedPrism.getRootNode().addChild(UIListNode);
    let listText = ui.UiText.Create(unlockedPrism, 'New background color');
    UIListNode.addChild(listText);
  }

  //This is where we create the HGeadlocked Ui
  createUiGrid() {
    this.gestureMap = {};

    let grid = ui.UiGridLayout.Create(this.prism);
    grid.setColumns(4);
    grid.setRows(2);
    grid.setAlignment(ui.Alignment.CENTER_CENTER);

    grid.setLocalPosition([0.0, 0.0, -1.0]);
    this.prism.getRootNode().addChild(grid);

    let UIPanel = ui.UiPanel.Create(this.prism);

    UIPanel.setLocalPosition([-0.3, 0.25, -0.1]);

    UIPanel.setLocalScale([1, 1, 1]);

    let pLinear = ui.UiLinearLayout.Create(this.prism);

    let timeText = ui.UiText.Create(this.prism, 'Time: 00.00.00');
    timeText.setLocalPosition([-0.025, 0, 0.05]);

    // Create function for update PSI
    let psi = ui.UiText.Create(this.prism, 'PSI: 4');
    psi.setLocalPosition([0.075, 0, 0.05]);

    // Create function for IVA connectivity
    let wifi = this.createUiImage('res/wifi.png');
    wifi.setLocalScale([0.15, 0.15, 0.15]);
    wifi.setLocalPosition([0.13, 0.008, 0.05]);
    let iva = ui.UiText.Create(this.prism, 'IVA');
    iva.setLocalPosition([0.14, 0, 0.05]);

    // Create function for fan speed
    let fanIcon = this.createUiImage('res/fanBlue.png');
    fanIcon.setLocalScale([0.18, 0.18, 0.18]);
    fanIcon.setLocalPosition([-0.017, -0.015, 0.05]);

    // Create function for fan speed text update
    let fanText = ui.UiText.Create(this.prism, '12000');
    fanText.setLocalPosition([-0.007, -0.022, 0.05]);

    // Create function for co2
    let co2Icon = this.createUiImage('res/co2Icon.png');
    co2Icon.setLocalScale([0.23, 0.23, 0.23]);
    co2Icon.setLocalPosition([0.05, -0.0145, 0.05]);

    // Create function for co2 text update
    let co2Text = ui.UiText.Create(this.prism, '550 PPM');
    co2Text.setLocalPosition([0.065, -0.022, 0.05]);

    // Create function for temperature
    let tempIcon = this.createUiImage('res/tempIcon.png');
    tempIcon.setLocalScale([0.22, 0.22, 0.22]);
    tempIcon.setLocalPosition([0.13, -0.0145, 0.05]);

    // Create function for temp text update
    let tempText = ui.UiText.Create(this.prism, '30 F');
    tempText.setLocalPosition([0.14, -0.022, 0.05]);

    // Create function for battery section: Icon, percentText, bar, timeRemaining, warningIcon
    let batteryIcon = this.createUiImage('res/battery.png');
    batteryIcon.setLocalScale([0.25, 0.22, 0.22]);
    batteryIcon.setLocalPosition([-0.005, -0.04, 0.05]);

    let battPercent = '50%'; // Pull real battPercent from fetch API
    let percentText = ui.UiText.Create(this.prism, battPercent);
    percentText.setLocalPosition([0.014, -0.048, 0.05]);

    let battBar = ui.UiProgressBar.Create(this.prism, 0.07, 0.01);
    battBar.setMinMax(0, 100);
    battBar.setValue(50);

    battBar.setLocalPosition([0.085, -0.041, 0.05]);

    let battTime = ui.UiText.Create(this.prism, '12:15:30');
    battTime.setLocalPosition([0.125, -0.048, 0.05]);

    // Create function for Secondary Temp section: Icon, percentText, bar, timeRemaining, warningIcon
    let temp2Icon = this.createUiImage('res/temp2Icon.png');
    temp2Icon.setLocalScale([0.22, 0.22, 0.22]);
    temp2Icon.setLocalPosition([-0.005, -0.062, 0.05]);

    let temp2Percent = '90%'; // Pull real temp2Percent from fetch API
    let temp2Text = ui.UiText.Create(this.prism, temp2Percent);
    temp2Text.setLocalPosition([0.014, -0.07, 0.05]);

    let temp2Bar = ui.UiProgressBar.Create(this.prism, 0.07, 0.01);
    temp2Bar.setMinMax(0, 100);
    temp2Bar.setValue(90);

    temp2Bar.setLocalPosition([0.085, -0.063, 0.05]);

    let temp2Time = ui.UiText.Create(this.prism, '06:25:33');
    temp2Time.setLocalPosition([0.125, -0.07, 0.05]);

    // Create function for Water Level section: Icon, percentText, bar, timeRemaining, warningIcon
    let waterLevelIcon = this.createUiImage('res/waterDropIcon.png');
    waterLevelIcon.setLocalScale([0.22, 0.22, 0.22]);
    waterLevelIcon.setLocalPosition([-0.005, -0.084, 0.05]);

    let waterLevelPercent = '10%'; // Pull real waterLevelPercent from fetch API
    let waterLevelText = ui.UiText.Create(this.prism, waterLevelPercent);
    waterLevelText.setLocalPosition([0.014, -0.092, 0.05]);

    let waterLevelBar = ui.UiProgressBar.Create(this.prism, 0.07, 0.01);
    waterLevelBar.setMinMax(0, 100);
    waterLevelBar.setValue(10);

    waterLevelBar.setLocalPosition([0.085, -0.085, 0.05]);

    waterLevelBar.onActivateSub(evt => {
      // printss += 0.01;

    });


    let waterLevelTime = ui.UiText.Create(this.prism, '00:26:56');
    waterLevelTime.setLocalPosition([0.125, -0.092, 0.05]);

    let testTexty = ui.UiText.Create(this.prism, 'HLPMEPLS');
    testTexty.setLocalPosition([0.25, -0.05, 0.05]);

    let UIPanelPanel = this.createUiImage('res/Panel.png');

    UIPanelPanel.setLocalPosition([-0.005, -0.084, 0.01]);

    //again must add item as child to any element that is attached to the prism
    UIPanel.addChild(psi);
    UIPanel.addChild(timeText);
    UIPanel.addChild(wifi);
    UIPanel.addChild(iva);
    UIPanel.addChild(fanIcon);
    UIPanel.addChild(fanText);
    UIPanel.addChild(co2Icon);
    UIPanel.addChild(co2Text);
    UIPanel.addChild(tempIcon);
    UIPanel.addChild(tempText);
    UIPanel.addChild(batteryIcon);
    UIPanel.addChild(percentText);
    UIPanel.addChild(battBar);
    UIPanel.addChild(temp2Icon);
    UIPanel.addChild(temp2Text);
    UIPanel.addChild(temp2Bar);
    UIPanel.addChild(waterLevelIcon);
    UIPanel.addChild(waterLevelText);
    UIPanel.addChild(waterLevelBar);
    UIPanel.addChild(battTime);
    UIPanel.addChild(temp2Time);
    UIPanel.addChild(waterLevelTime);

    UIPanel.setVisible(true);


    grid.addChild(UIPanel);
    grid.addChild(this.leftPanelCreate(true));
    grid.addChild(this.createToolboxPanel());


    let menuPanel = ui.UiPanel.Create(this.prism);
    menuPanel.setLocalPosition([0.3, 0.2, -0.1]);

    grid.addChild(menuPanel);

    let linear = ui.UiLinearLayout.Create(this.prism);
    linear.setAlignment(ui.Alignment.CENTER_LEFT);
    linear.setDefaultItemPadding([0.01, 0.01, 0.01, 0.01]);
    this.leftText = ui.UiText.Create(this.prism, '');
    this.rightText = ui.UiText.Create(this.prism, '');


    grid.addChild(linear);
    linear.setLocalPosition([-0.2, 0.15, 0.0]);

  }
  //moot(?)
  createCameraScreen() {
    CameraScreenPanel = ui.UiPanel.Create(this.prism);
    CameraScreenPanel.setLocalPosition([-0.05, 0.3, 0]);
    CameraScreenPanel.setLocalScale([5, 2.5, 1]);

    let cameraShot = this.createUiImage('res/c2.png');

    cameraShot.setLocalPosition([0.04, -0.084, 0]);

    CameraScreenPanel.addChild(cameraShot);

    return CameraScreenPanel;
  }
  createToolboxPanel() {
    /** *****************TOOLKIT***********************************/

    ToolkitPanel = ui.UiPanel.Create(this.prism);

    ToolkitPanel.setLocalPosition([-0.05, 0.3, -0.1]);

    ToolkitPanel.setLocalScale([2, 2, 2]);

    unlockedPrism.getRootNode().addChild(ToolkitPanel);

    let rakePic = this.createUiImage('res/rake2.png');
    rakePic.setLocalScale([0.3, 0.7, 0]);
    rakePic.setLocalPosition([0.01, -0.084, 0.05]);

    let RakeHeader = ui.UiText.Create(this.prism, 'Rake');
    RakeHeader.setLocalPosition([-0.005, -0.14, 0.05]);
    RakeHeader.setLocalScale([0.8, 0.8, 0.8]);

    let tongsPic = this.createUiImage('res/tongs.png');
    tongsPic.setLocalScale([0.3, 0.7, 0]);
    tongsPic.setLocalPosition([0.08, -0.084, 0.05]);

    let TongsHeader = ui.UiText.Create(this.prism, 'Tongs');
    TongsHeader.setLocalPosition([0.065, -0.14, 0.05]);
    TongsHeader.setLocalScale([0.8, 0.8, 0.8]);

    let containerPic = this.createUiImage('res/container.png');
    containerPic.setLocalScale([0.3, 0.3, 0]);
    containerPic.setLocalPosition([0.15, -0.084, 0.05]);

    let ContainerHeader = ui.UiText.Create(this.prism, 'Container');
    ContainerHeader.setLocalPosition([0.13, -0.14, 0.05]);
    ContainerHeader.setLocalScale([0.8, 0.8, 0.8]);

    let ToolkitHeader = ui.UiText.Create(this.prism, 'GATHER ROCK SAMPLING EQUIPMENT');
    ToolkitHeader.setLocalPosition([0.015, -0.03, 0.05]);
    ToolkitHeader.setLocalScale([0.6, 0.6, 0.6]);

    ToolkitPanel.addChild(rakePic);
    ToolkitPanel.addChild(tongsPic);
    ToolkitPanel.addChild(containerPic);
    ToolkitPanel.addChild(ToolkitHeader);
    ToolkitPanel.addChild(RakeHeader);
    ToolkitPanel.addChild(TongsHeader);
    ToolkitPanel.addChild(ContainerHeader);
    ToolkitPanel.setVisible(false);

    return ToolkitPanel;

    /** *****************END TOOLKIT*******************************/
  }

  leftPanelCreate() {
    // 2
    /** *******************Left Panel*****************************/
    // if(leftPanelIndex == 0){
    InstructionsPanel = ui.UiPanel.Create(this.prism);

    InstructionsPanel.setLocalPosition([-0.3, 0.2, -0.1]);

    InstructionsPanel.setLocalScale([1, 1, 1]);

    animationIcon = this.createUiImage('res/normal/animation.png');
    animationIcon.setLocalScale([0.22, 0.22, 0.22]);
    animationIcon.setLocalPosition([-0.005, -0.084, 0.05]);

    animationIconHovered = this.createUiImage('res/hover/animation_hover.png');
    animationIconHovered.setLocalScale([0.22, 0.22, 0.22]);
    animationIconHovered.setLocalPosition([-0.005, -0.084, 0.05]);

    toolkitIcon = this.createUiImage('res/normal/toolkit.png');
    toolkitIcon.setLocalScale([0.22, 0.22, 0.22]);
    toolkitIcon.setLocalPosition([0.05, -0.084, 0.05]);

    toolkitIconHovered = this.createUiImage('res/hover/toolkit_hover.png');
    toolkitIconHovered.setLocalScale([0.22, 0.22, 0.22]);
    toolkitIconHovered.setLocalPosition([0.05, -0.084, 0.05]);


    recordIcon = this.createUiImage('res/normal/record.png');
    recordIcon.setLocalScale([0.22, 0.22, 0.22]);
    recordIcon.setLocalPosition([0.105, -0.084, 0.05]);

    recordIconHovered = this.createUiImage('res/hover/record_hover.png');
    recordIconHovered.setLocalScale([0.22, 0.22, 0.22]);
    recordIconHovered.setLocalPosition([0.105, -0.084, 0.05]);

    cameraIcon = this.createUiImage('res/normal/camera.png');
    cameraIcon.setLocalScale([0.22, 0.22, 0.22]);
    cameraIcon.setLocalPosition([0.16, -0.084, 0.05]);

    cameraIcon = this.createUiImage('res/hover/camera_hover.png');
    cameraIcon.setLocalScale([0.22, 0.22, 0.22]);
    cameraIcon.setLocalPosition([0.16, -0.084, 0.05]);

    InstructionsHeader = ui.UiText.Create(this.prism, 'GATHER EQUIPMENT');
    InstructionsHeader.setLocalPosition([-0.015, -0.13, 0.05]);

    InstructionsBody = ui.UiText.Create(this.prism, 'Put the tools into your carrier bag.\n Validate that all necessary \nequipment are in the bag: \n1. Tongs \n2. Rake \n3. Container');
    InstructionsBody.setLocalPosition([-0.015, -0.225, 0.05]);


    stepTracker = this.createUiImage('res/step_tracker/step_tracker1.png');
    stepTracker.setLocalScale([1.85, 0.22, 1]);
    stepTracker.setLocalPosition([0.078, -0.34, 0.05]);


    pageImage2 = this.createUiImage('res/step_tracker/step_tracker2.png');
    pageImage2.setLocalScale([1.85, 0.22, 1]);
    pageImage2.setLocalPosition([0.078, -0.34, 0.05]);


    pageImage3 = this.createUiImage('res/step_tracker/step_tracker3.png');
    pageImage3.setLocalScale([1.85, 0.22, 1]);
    pageImage3.setLocalPosition([0.078, -0.34, 0.05]);


    pageImage4 = this.createUiImage('res/step_tracker/step_tracker4.png');
    pageImage4.setLocalScale([1.85, 0.22, 1]);
    pageImage4.setLocalPosition([0.078, -0.34, 0.05]);

    pageImage5 = this.createUiImage('res/step_tracker/step_tracker5.png');
    pageImage5.setLocalScale([1.85, 0.22, 1]);
    pageImage5.setLocalPosition([0.078, -0.34, 0.05]);

    pageImage6 = this.createUiImage('res/step_tracker/step_tracker6.png');
    pageImage6.setLocalScale([1.85, 0.22, 1]);
    pageImage6.setLocalPosition([0.078, -0.34, 0.05]);

    pageImage7 = this.createUiImage('res/step_tracker/step_tracker7.png');
    pageImage7.setLocalScale([1.85, 0.22, 1]);
    pageImage7.setLocalPosition([0.078, -0.34, 0.05]);


    InstructionsPanel.addChild(animationIcon);
    InstructionsPanel.addChild(toolkitIcon);
    InstructionsPanel.addChild(recordIcon);
    InstructionsPanel.addChild(cameraIcon);
    InstructionsPanel.addChild(InstructionsHeader);
    InstructionsPanel.addChild(InstructionsBody);
    InstructionsPanel.addChild(stepTracker);
    InstructionsPanel.setVisible(false);



    return InstructionsPanel;

    /** *****************END INSTRUCTIONS***************************/
  }
  //Moot
  updateTest() {

    this.prism.grid.ToolkitPanel.rakePic.setLocalPosition([px, 0, 0]);
    px += 0.005;
  }
  //moot?
  createSliderGrid() {
    let grid = ui.UiGridLayout.Create(this.prism);
    grid.setAlignment(ui.Alignment.CENTER_LEFT);
    grid.setRows(3);
    grid.setColumns(2);
    grid.setDefaultItemPadding([0.0, 0.0, 0.0, 0.0]);

    let params = new ui.EclipseSliderParams(ui.EclipseSliderType.kHorizontalWithLabel, 'Poll Rate', '');

    this.prism.setHandGestureFilterPollRate(20.0);
    let pollText = ui.UiText.Create(this.prism, '20');
    pollText.setTextSize(0.03);
    let pollSlider = ui.UiSlider.CreateEclipseSlider(this.prism, params);
    pollSlider.setMinMax(5.0, 30.0);
    pollSlider.setValue(20.0);
    pollSlider.onSliderChangedSub(evt => {
      let pollRate = Math.round(pollSlider.getValue());
      pollText.setText(pollRate.toString());
      this.prism.setHandGestureFilterPollRate(pollRate);
    });
    grid.addItem(pollSlider);
    grid.addItem(pollText);
    grid.setItemAlignment(pollText, ui.Alignment.BOTTOM_CENTER);

    params.labelText1 = 'Hand Delta';
    this.prism.setHandGestureFilterPositionDelta(0.001);
    let deltaText = ui.UiText.Create(this.prism, '0.001');
    deltaText.setTextSize(0.03);
    let deltaSlider = ui.UiSlider.CreateEclipseSlider(this.prism, params);
    deltaSlider.setMax(0.01);
    deltaSlider.setValue(0.001);
    deltaSlider.onSliderChangedSub(evt => {
      let delta = deltaSlider.getValue();
      deltaText.setText(delta.toFixed(3));
      this.prism.setHandGestureFilterPositionDelta(delta);
    });
    grid.addItem(deltaSlider);
    grid.addItem(deltaText);
    grid.setItemAlignment(deltaText, ui.Alignment.BOTTOM_CENTER);

    params.labelText1 = 'Min Confidence';
    this.prism.setHandGestureFilterConfidenceLevel(0.5);
    let conText = ui.UiText.Create(this.prism, '0.5');
    conText.setTextSize(0.03);
    let conSlider = ui.UiSlider.CreateEclipseSlider(this.prism, params);
    conSlider.setValue(0.5);
    conSlider.onSliderChangedSub(evt => {
      let con = conSlider.getValue();
      conText.setText(con.toFixed(2));
      this.prism.setHandGestureFilterConfidenceLevel(con);
    });
    grid.addItem(conSlider);
    grid.addItem(conText);
    grid.setItemAlignment(conText, ui.Alignment.BOTTOM_CENTER);

    grid.setLocalPosition([-0.2, -0.15, 0.0]);
    grid.setLocalScale([0.75, 0.75, 0.75]);

    return grid;
  }

  //Probably how we should be doing this for everything
  //currently unused
  createUiImage(filepath, gesture) {
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
  //Transforming gesture data to string format
  gestureToString(gesture) {
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
//changing to flag
  gestureToFlag(gesture) {
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