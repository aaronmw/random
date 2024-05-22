import { PropertySettings } from "@/lib/pluginTypes"

export const colorBasedPropertyOptions: PropertySettings = {
  mode: "list",
  modeOptions: {
    list: {
      options: [
        "#000000",
        "#f23b27",
        "#fd605a",
        "#9851f9",
        "#1ab7fa",
        "#1bca7c",
      ],
    },
  },
  isRandomized: false,
  sortOrder: "random",
}

export const degreeBasedPropertyOptions: PropertySettings = {
  mode: "list",
  modeOptions: {
    calc: {
      decimalPlaces: 0,
      add: {
        max: 180,
        min: 0,
      },
      multiply: {
        max: 2,
        min: 0.5,
      },
      operator: "add",
    },
    list: {
      options: [0, 45, 90, 135, 180, 225, 270, 315, 360],
    },
    range: {
      min: 0,
      max: 360,
    },
  },
  isRandomized: false,
  sortOrder: "random",
}

export const integerBasedPropertyOptions: PropertySettings = {
  mode: "list",
  modeOptions: {
    calc: {
      decimalPlaces: 0,
      add: {
        max: 50,
        min: 0,
      },
      multiply: {
        max: 2,
        min: 0.5,
      },
      operator: "add",
    },
    list: {
      options: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    },
    range: {
      min: 50,
      max: 200,
    },
  },
  isRandomized: false,
  sortOrder: "random",
}

export const colorChannelBasedPropertyOptions: PropertySettings = {
  ...integerBasedPropertyOptions,
  modeOptions: {
    calc: {
      decimalPlaces: 0,
      add: {
        max: 50,
        min: 0,
      },
      multiply: {
        max: 5,
        min: 0.5,
      },
      operator: "add",
    },
    list: {
      options: [
        0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
        90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160,
        165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230,
        235, 240, 245, 250, 255,
      ],
    },
    range: {
      min: 50,
      max: 200,
    },
  },
}

export const percentageBasedPropertyOptions: PropertySettings = {
  mode: "range",
  modeOptions: {
    calc: {
      decimalPlaces: 0,
      add: {
        max: 100,
        min: 0,
      },
      multiply: {
        max: 2,
        min: 0.5,
      },
      operator: "add",
    },
    list: {
      options: [0, 25, 50, 75, 100],
    },
    range: {
      max: 100,
      min: 0,
    },
  },
  isRandomized: false,
  sortOrder: "random",
}

export const textBasedPropertyOptions: PropertySettings = {
  mode: "list",
  modeOptions: {
    calc: {
      decimalPlaces: 0,
      add: {
        max: 50,
        min: 0,
      },
      multiply: {
        max: 2,
        min: 0.5,
      },
      operator: "add",
    },
    list: {
      options: [
        "Bubbles McFluffy",
        "Squeaky McSqueak",
        "Professor Wigglesworth",
        "Lady Pancake",
        "Sir Fuzzybottom",
        "Baron von Biscuit",
        "Captain Wobblepants",
        "Princess Snugglebuns",
        "Count Fluffernutter",
        "Duchess Puddingpop",
        "Lord Tickles",
        "Queen Wiggletail",
        "Doctor Quackenbush",
        "Muffin McSprinkle",
        "Squire Pompom",
        "Madame Fluffernoodle",
        "General Flapjack",
        "Sheriff Cuddles",
        "Admiral Buttercup",
        "Miss Puddingfoot",
      ],
    },
    range: {
      max: 200,
      min: 50,
    },
  },
  isRandomized: false,
  sortOrder: "random",
  prefix: "",
  suffix: "",
  thousandsSeparator: "",
}
