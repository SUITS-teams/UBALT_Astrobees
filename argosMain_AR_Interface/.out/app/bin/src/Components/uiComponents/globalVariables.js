var mainMenuButtons = {
  home: {
    name: 'homeBtn',
    normalIcon: 'res/home.png',
    hoverIcon: 'res/exploration.png',
    hoverName: 'homeBtnHover',
    displayName: 'Home',
    x: 0,
    y: 0,
    z: -1
  },
  science: {
    name: 'scienceBtn',
    normalIcon: 'res/sample.png',
    hoverIcon: 'res/ss_hover.png',
    hoverName: 'scienceBtnHover',
    displayName: 'Science Sampling',
    x: 0,
    y: 0.15,
    z: -1
  },
  exploration: {
    name: 'expBtn',
    normalIcon: 'res/exploration.png',
    hoverIcon: 'res/destination_hover.png',
    hoverName: 'explorationBtnHover',
    displayName: 'Exploration',
    x: 0.105,
    y: -0.105,
    z: -1
  },
  rover: {
    name: 'roverBtn',
    normalIcon: 'res/rover.png',
    hoverIcon: 'res/rover_hover.png',
    hoverName: 'roverBtnHover',
    displayName: 'Rover Repair',
    x: 0.134,
    y: 0.065,
    z: -1
  },
  toolkit: {
    name: 'toolBtn',
    normalIcon: 'res/tool.png',
    hoverIcon: 'res/toolkit_hover.png',
    hoverName: 'toolBtnHover',
    displayName: 'Toolbox',
    x: -0.134,
    y: 0.065,
    z: -1
  },
  navigation: {
    name: 'navBtn',
    normalIcon: 'res/nav.png',
    hoverIcon: 'res/navigation_hover.png',
    hoverName: 'navBtnHover',
    displayName: 'Navigation',
    x: -0.105,
    y: -0.105,
    z: -1
  }
};

var scienceSamplingMenuButtons = {
  animations: {
    name: 'animationBtn',
    normalIcon: 'res/animation.png',
    hoverIcon: 'res/animation_hover.png',
    hoverName: 'animationBtnHover',
    x: -0.46,
    y: 0.2,
    z: -1.25
  },
  equipment: {
    name: 'equipmentBtn',
    normalIcon: 'res/toolkit.png',
    hoverIcon: 'res/tool_hover.png',
    hoverName: 'scienceBtnHover',
    displayName: 'Science Sampling',
    x: -0.36,
    y: 0.2,
    z: -1.25
  },
  fieldNotes: {
    name: 'notesBtn',
    normalIcon: 'res/record.png',
    hoverIcon: 'res/record_hover.png',
    hoverName: 'explorationBtnHover',
    displayName: 'Exploration',
    x: -0.26,
    y: 0.2,
    z: -1.25
  },
  capture: {
    name: 'captureBtn',
    normalIcon: 'res/camera.png',
    hoverIcon: 'res/camera_hover.png',
    hoverName: 'roverBtnHover',
    displayName: 'Rover Repair',
    x: -0.16,
    y: 0.2,
    z: -1.25
  }
};

var scienceSamplingSteps = {
  1: {
    header: 'GATHER EQUIPMENT',
    description: 'Put the tools into the carrier bag. \nMake sure you have the \nfollowing ' +
    'equipment in the bag: \n1. Tools \n2. Rake \n3. Container \n4. Labels (in the bag)',
    icon: 'res/step_tracker1.png'
  },
  2: {
    header: 'LOCATE SAMPLE AREA',
    description: 'Once you have all of the \nequipment in the bag,\n head to the sample site',
    icon: 'res/step_tracker2.png'
  },
  3: {
    header: 'CLEAR SAMPLE',
    description: 'Use the rake to sift through \nthe terrain and clear extra \nresidue obstructing the sample.',
    icon: 'res/step_tracker3.png'
  },
  4: {
    header: 'PICK UP SAMPLE',
    description: '\n \n \nTake the tongs and squeeze\n the handle to clamp\n the pincers. ' +
    'Use this tool\n to pick up the sample\n \n In the next step, ' +
    'ARGOS\nwill begin recording audio \nfor your field notes',
    icon: 'res/step_tracker4.png'
  },
  5: {
    header: 'FIELD NOTES',
    description: 'Record a description of the rock.\n Be sure to state:\n1.Approximation ' +
    "of Size\n2.Color/Patterns\n3.Texture \nTo start recording say: \n'Hey Lumin, " +
    "record video'. \nTo stop recording, say:\n'Hey Lumin, stop recording'",
    icon: 'res/step_tracker5.png'
  },
  6: {
    header: 'TAKE A PHOTO',
    description: 'Use the camera function to\n take a photo of the sample. \n To ' +
    "take a photo, say: \n'Hey Lumin, take a photo'.",
    icon: 'res/step_tracker6.png'
  },
  7: {
    header: 'STORE SAMPLE',
    description: 'Twist the lid on the container\n to seal the sample. \nPlace the ' +
    'sample into the bag.\n \nYou have completed rock sample \ncollection.',
    icon: 'res/step_tracker7.png'
  }
};

var tools = {
  rake: {
    path: 'res/rake.glb',
    scale: 0.1,
    title: '\nRake',
    dimensions: "Dimensions: 10''",
    location: 'Location: Utility box 5001',
    use: '\nThe rake is used to sift through\nsediments ' +
    'to identify rock samples'
  },
  tongs: {
    path: 'res/tongs.glb',
    scale: 0.08,
    title: '\nTongs',
    dimensions: "Dimensions: 32''",
    location: 'Location: Utility box 5001',
    use: '\nThe tongs are used to pick up\n' +
    'and place sample items'
  },
  container: {
    path: 'res/sample_container.glb',
    scale: 0.1,
    title: '\nContainer',
    dimensions: "Dimensions: 5 x 10''",
    location: 'Location: Utility box 5001',
    use: '\nThe container is used to\n' +
    'store rock samples'
  },
  hammer: {
    path: 'res/hammer.glb',
    scale: 0.1
  },
  shovel: {
    path: 'res/shovel.glb',
    scale: 0.1
  },
  scoop: {
    path: 'res/scoop.glb',
    scale: 0.1
  },
  extensionHandle: {
    path: 'res/extension_handle.glb',
    scale: 0.1
  },
  brush_scriber_lens: {
    path: 'res/brush_scribber_lens.glb',
    scale: 0.1
  },
  contact_soli_sampling: {
    path: 'res/contact_soil_sampling.glb',
    scale: 0.1
  }
};
var sampleTelemetryStream = {
  1: {
    data: 'Time',
    hasIcon: false,
    title: 'Time: ',
    hasSlider: false,
    value: '12:03:02',
    tier: 1,
    subTier: 1,
    sub_sub_tier: 1
  },
  2: {
    data: 'Oxygen Pressure',
    hasIcon: true,
    icon: 'res/o2_pressure2.png',
    title: '02pressure: ',
    hasSlider: true,
    value: '30'
  },
  3: {
    data: 'Oxygen Rate',
    hasIcon: true,
    icon: 'res/oxygen_rate.png',
    title: 'Oxygen Rate: ',
    hasSlider: true,
    value: '35'
  },
  4: {
    data: 'Battery Capacity',
    hasIcon: true,
    icon: 'res/battery.png',
    title: 'Time: ',
    hasSlider: true,
    value: '50%'
  },
  5: {
    data: 'Amp Indicator',
    hasIcon: false,
    title: 'Amp: ',
    hasSlider: false,
    value: 'High!'
  }
};

export { mainMenuButtons, sampleTelemetryStream, scienceSamplingMenuButtons, scienceSamplingSteps, tools };
