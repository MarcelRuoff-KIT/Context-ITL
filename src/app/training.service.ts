import { Injectable } from '@angular/core';

@Injectable()
export class TrainingService {

  constructor() { }

  public initialize = false
  public initialVisualizationState: any = {}
  public initialEntities: any = { "DATAFIELD": [], "VISUALIZATION": [] }
  public possibleActions: any = [{ "Action": {}, "ID": 0, "Score": 0 }, { "Action": {}, "ID": 1, "Score": 1 }, { "Action": {}, "ID": 2, "Score": 2 }, { "Action": {}, "ID": 3, "Score": 3 }, { "Action": {}, "ID": 4, "Score": 4 }, { "Action": {}, "ID": 5, "Score": 5 }]
  public actionScriptSize = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  public initialActions: any = []
  public baseAction = { "Action": {}, "ID": 0, "Score": 0, 'ScoreFuture': 0, "Constraints": [], "ConstraintsText": [], "scriptSelect": false }
  public selectedAmbiguity = 1
  public verbs = ["ADD", "REMOVE"]
  public nlInput = []
  public lastVisualizationState: any = {}



  async initializeTraining(that, possibleActions) {
    this.actionScriptSize = []
    this.initialize = true
    this.selectedAmbiguity = 0

    console.log(possibleActions)

    this.initialVisualizationState = JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState))

    this.possibleActions = [JSON.parse(JSON.stringify(this.baseAction))]
    this.actionScriptSize.push(0)
    that.visCanvas.possibleVisualizationStates.push(JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)))
    await that.visCanvas.createVisualization(that, that.visCanvas.currentVisualizationState, "#Ambiguity_0", "small")

    var index = 0
    for (var i = 0; i < possibleActions.length; i++) {
      this.actionScriptSize.push(0)
      this.possibleActions.push({ "Action": {}, "ID": possibleActions[i]["ID"], "Score": possibleActions[i]["Score"], "ScoreFuture": possibleActions[i]["ScoreFuture"], 'newAmbiguity': possibleActions[i]["newAmbiguity"], "Constraints": possibleActions[i]["Constraints"], "ConstraintsText": possibleActions[i]["ConstraintsText"], "scriptSelect": false })
      that.visCanvas.possibleVisualizationStates.push(JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)))
      //element["Action"].forEach(actionEntity => {
      await that.infoVisInteraction.processAction(that, that.visCanvas.possibleVisualizationStates[possibleActions[i]["ID"]], possibleActions[i]["Action"], true, possibleActions[i]["ID"])
      //})


      await that.visCanvas.createVisualization(that, that.visCanvas.possibleVisualizationStates[possibleActions[i]["ID"]], "#Ambiguity_" + possibleActions[i]["ID"], "small")
      index++
    }
    if (index > 0) {
      this.selectedAmbiguity = 1
      that.visCanvas.currentVisualizationState = that.visCanvas.possibleVisualizationStates[1]
      //that.nlg.initializeUnderstandingDisplay(that, this.possibleActions[1]["Action"], "training", this.selectedAmbiguity)
    }
    else {
      that.visCanvas.currentVisualizationState = that.visCanvas.possibleVisualizationStates[0]
    }
    this.initialActions = JSON.parse(JSON.stringify(this.possibleActions))

    this.initialize = false
  }

  async changeAmbiguityInterpretation(that, actions) {
    var newState = JSON.parse(JSON.stringify(this.initialVisualizationState))
    await that.infoVisInteraction.processAction(that, newState, actions["Action"], false, null)

    return newState
  }


  async adaptActionList(that, visualizationState, key, verb, elements, ambiguity) {
    var contradicting = false

    if (that.overallMode == 2 && !that.speechInteraction && Object.keys(that.lastSpeechInteraction).length == 0) {

    }
    else {

      if (that.overallMode == 2) {
        var integralAction = {}
        var refinedActionList = that.lastSpeechInteraction
      }
      else {
        if (!ambiguity) {
          ambiguity = this.selectedAmbiguity
        }

        var integralAction = {}
        var refinedActionList = this.possibleActions[ambiguity]["Action"]
      }



      if (key == "VISUALIZATION") {
        integralAction = refinedActionList[key]
        if (typeof (integralAction) == "undefined") {
          integralAction = { "ADD": [], "REMOVE": [] }
        }
        else {
          contradicting = true
        }
        delete refinedActionList[key]
        integralAction[verb] = [elements]
        refinedActionList[key] = integralAction
      }
      else if (key == "Aggregate") {
        integralAction = refinedActionList[key]
        if (typeof (integralAction) == "undefined") {
          integralAction = { "ADD": [], "REMOVE": [] }
        }
        delete refinedActionList[key]
        if (integralAction[verb].filter(element => element["KEY"] != elements[0]["KEY"]).length == 1) {
          elements.unshift(integralAction[verb].filter(element => element["KEY"] != elements[0]["KEY"])[0])
        }
        else if (integralAction[verb].filter(element => element["KEY"] != elements[0]["KEY"]).length > 1) {
          elements.unshift(integralAction[verb].filter(element => element["KEY"] != elements[0]["KEY"])[1])
        }
        integralAction[verb] = elements
        refinedActionList[key] = integralAction
      }
      else if (key == "x-Axis" || key == "Color" || key == "Values") {
        integralAction = refinedActionList[key]
        if (typeof (integralAction) == "undefined") {
          integralAction = { "ADD": [], "REMOVE": [] }
        }
        delete refinedActionList[key]
        if (verb == "ADD" && elements.length > 0) {
          if (key != "Values") {
            integralAction[verb] = []
          }
          elements.forEach(element => {
            if (integralAction[this.verbs.filter(element => element != verb)[0]].includes(element)) {
              contradicting = true
              integralAction[this.verbs.filter(element => element != verb)[0]] = integralAction[this.verbs.filter(element => element != verb)[0]].filter(id => id != element)
            }
            else {
              integralAction[verb].push(element)
            }
          })

          integralAction[verb] = [...new Set(integralAction[verb].reverse())].reverse();
        }
        else if (verb == "REMOVE" && elements.length > 0) {
          if (elements.includes("ALL")) {
            integralAction[this.verbs.filter(element => element != verb)[0]] = []
            integralAction[verb] = ["ALL"]

          }
          else {
            elements.forEach(element => {
              if (integralAction[this.verbs.filter(element => element != verb)[0]].includes(element)) {
                contradicting = true
                integralAction[this.verbs.filter(element => element != verb)[0]] = integralAction[this.verbs.filter(element => element != verb)[0]].filter(id => id != element)
              }
              else {
                integralAction[verb].push(element)
              }
            })
          }

        }
        refinedActionList[key] = integralAction
      }
      else if (["Highlight", "ColorHighlight", "Filter"].includes(key)) {
        integralAction = refinedActionList[key]
        if (typeof (integralAction) == "undefined") {
          integralAction = { "ADD": [], "REMOVE": [] }
        }
        delete refinedActionList[key]
        if (verb == "ADD" && elements.length > 0) {
          if (elements.includes("ALL")) {
            integralAction[this.verbs.filter(element => element != verb)[0]] = []
            integralAction[verb] = ["ALL"]

          }
          else {
            elements.forEach(element => {
              if (integralAction[this.verbs.filter(element => element != verb)[0]].includes(element)) {
                contradicting = true
                integralAction[this.verbs.filter(element => element != verb)[0]] = integralAction[this.verbs.filter(element => element != verb)[0]].filter(id => id != element)
              }
              else {
                if (key == "Highlight") {
                  integralAction[verb] = [element]
                  

                }
                else {
                  integralAction[verb].push(element)

                }
              }
            })

          }
        }
        else if (verb == "REMOVE" && elements.length > 0) {
          if (elements.includes("ALL")) {
            integralAction[this.verbs.filter(element => element != verb)[0]] = []
            integralAction[verb] = ["ALL"]

          }
          else {
            for (var i = 0; i < elements.length; i++) {
              if (integralAction[this.verbs.filter(element => element != verb)[0]].includes(elements[i])) {
                contradicting = true
                integralAction[this.verbs.filter(element => element != verb)[0]] = integralAction[this.verbs.filter(element => element != verb)[0]].filter(id => id != elements[i])
              }
              else {
                integralAction[verb].push(elements[i])
              }

              if (key == "Filter" && that.visCanvas.dataFieldsConfig[elements[i]] != "quantitative") {
                refinedActionList["FilterC"]["ADD"] = refinedActionList["FilterC"]["ADD"].filter(filterKey => filterKey["KEY"] != elements[i])

                refinedActionList["FilterC"]["REMOVE"] = refinedActionList["FilterC"]["REMOVE"].filter(filterKey => filterKey["KEY"] != elements[i])
              }

            }
          }

        }
        refinedActionList[key] = integralAction
      }
      else if (key == "FilterC") {
        var id = elements["KEY"]
        var items = elements["ID"]
        integralAction = refinedActionList[key]
        if (typeof (integralAction) == "undefined") {
          integralAction = { "ADD": [], "REMOVE": [] }
        }
        delete refinedActionList[key]

        var current = integralAction[verb].filter(element => element["KEY"] == id)
        var opposit = integralAction[this.verbs.filter(element => element != verb)[0]].filter(element => element["KEY"] == id)


        if (items.includes("ALL")) {
          if (opposit.length != 0) {
            contradicting = true
          }
          opposit = []
          if (current.length > 0) {
            current[0]["ID"] = ["ALL"]
          }
          else {
            current = [{ "KEY": id, "ID": ["ALL"] }]
          }
        }
        else {
          items.forEach(element => {
            if (opposit.length > 0 && opposit[0]["ID"].includes(element)) {
              contradicting = true
              opposit[0]["ID"] = opposit[0]["ID"].filter(id => id != element)
            }
            else {
              if (current.length > 0) {
                current[0]["ID"].push(element)
              }
              else {
                current = [{ "KEY": id, "ID": [element] }]
              }
            }
          })
        }

        integralAction[verb] = integralAction[verb].filter(element => element["KEY"] != id)

        integralAction[this.verbs.filter(element => element != verb)[0]] = integralAction[this.verbs.filter(element => element != verb)[0]].filter(element => element["KEY"] != id)

        if (current.length > 0 && current[0]["ID"].length > 0) {
          integralAction[verb].push(current[0])
        }
        if (opposit.length > 0 && opposit[0]["ID"].length > 0) {
          integralAction[this.verbs.filter(element => element != verb)[0]].push(opposit[0])
        }





        refinedActionList[key] = integralAction
      }
      else if (key == "FilterN") {
        var id = elements["Filter"]

        integralAction = refinedActionList[key]
        if (typeof (integralAction) == "undefined") {
          integralAction = { "ADD": [], "REMOVE": [] }
        }
        delete refinedActionList[key]

        var add = null
        var remove = null

        var originalGT = that.training.initialVisualizationState["FilterN"][id][0]
        var newGT = that.visCanvas.currentVisualizationState["FilterN"][id][0]
        var originalLT = that.training.initialVisualizationState["FilterN"][id][1]
        var newLT = that.visCanvas.currentVisualizationState["FilterN"][id][1]

        if (originalGT != newGT && originalLT != newLT) {
          verb = "ADD"
          add = { "Filter": id, "GT": newGT, "LT": newLT }
        }
        else if (originalGT > newGT) {
          verb = "ADD"
          if (newLT == that.visCanvas.maxList[id][that.visCanvas.currentVisualizationState["Aggregate"][id]]) {
            add = { "Filter": id, "GT": newGT }
          }
          else {
            add = { "Filter": id, "GT": newGT, "LT": newLT }
          }
        }
        else if (originalGT < newGT) {
          verb = "REMOVE"
          remove = { "Filter": id, "LT": newGT }
        }
        else if (originalLT < newLT) {
          verb = "ADD"
          if (newGT == 0) {
            add = { "Filter": id, "LT": newLT }
          }
          else {
            add = { "Filter": id, "GT": newGT, "LT": newLT }
          }
        }
        else if (originalLT > newLT) {
          verb = "REMOVE"
          remove = { "Filter": id, "GT": newLT }
        }


        integralAction["ADD"] = integralAction["ADD"].filter(element => element["Filter"] != id)

        integralAction["REMOVE"] = integralAction["REMOVE"].filter(element => element["Filter"] != id)

        if (add != null) {
          integralAction["ADD"].push(add)

        }
        if (remove != null) {
          integralAction["REMOVE"].push(remove)
        }

        refinedActionList[key] = { [this.verbs.filter(element => element != verb)[0]]: integralAction[this.verbs.filter(element => element != verb)[0]], [verb]: integralAction[verb] }

      }

      var allKeys = Object.keys(refinedActionList)
      for (var i = 0; i < allKeys.length; i++) {
        if (!((Object.keys(refinedActionList[allKeys[i]]).includes("ADD") && refinedActionList[allKeys[i]]["ADD"].length > 0) || (Object.keys(refinedActionList[allKeys[i]]).includes("REMOVE") && refinedActionList[allKeys[i]]["REMOVE"].length > 0))) {
          delete refinedActionList[allKeys[i]]
        }

      }


      if (that.overallMode != 2) {
        if (!this.initialize) {
          await that.visCanvas.createVisualization(that, visualizationState, "#Ambiguity_" + ambiguity, "small")
        }

        await that.nlg.initializeUnderstandingDisplay(that, refinedActionList, "training", ambiguity)
      }
      else if (contradicting && !that.speechInteraction && !that.revokedSpeech) {
        that.askForTraining = true

        that.directLine
          .postActivity({
            from: { id: "USER_ID", name: "USER_NAME" },
            name: "askForTraining",
            type: "event",
          })
          .subscribe(
            id => {
              if (sessionStorage.getItem('conversationID') == null) {
                sessionStorage.setItem('conversationID', that.directLine.conversationId);
              };
            },
            error => console.log(`Error posting activity ${error}`)
          );
        that.lastSpeechInteraction = {}
      }
    }
  }

  removeAction(that, targetElement) {
    if (Object.keys(this.possibleActions[this.selectedAmbiguity]["Action"]).includes(targetElement[0].toString())) {
      if (targetElement[0] == "VISUALIZATION") {
        this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()]["ADD"] = []
      }
      else if (targetElement[1] == "ALL") {
        this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()] = {}
      }
      else if (targetElement[0] == "Filter") {

        for (var i = 0; i < this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()].length; i++) {

          if (that.visCanvas.dataFieldsConfig[this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()][i]] == 'quantitative' && this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]) {

            if (this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["ADD"])
              this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["ADD"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["ADD"].filter(filterKey => filterKey["Filter"] != this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()][i])

            if (this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["REMOVE"])
              this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["REMOVE"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["REMOVE"].filter(filterKey => filterKey["Filter"] != this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()][i])

          }
          else if(this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]){
            if (this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["ADD"])
              this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["ADD"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["ADD"].filter(filterKey => filterKey["KEY"] != this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()][i])
            if (this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["REMOVE"])
              this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["REMOVE"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["REMOVE"].filter(filterKey => filterKey["KEY"] != this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()][i])
          }
        }

        this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()] = []


      }
      else {
        this.possibleActions[this.selectedAmbiguity]["Action"][targetElement[0].toString()][targetElement[1].toString()] = []
      }
    }
    else if (["State", "Energy Type", "Party of Governor", "Investment Type", "Year"].includes(targetElement[0].toString())) {
      if (targetElement[1] == "ALL") {
        this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["ADD"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["ADD"].filter(element => element["KEY"] != targetElement[0].toString())
        this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["REMOVE"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"]["REMOVE"].filter(element => element["KEY"] != targetElement[0].toString())
      }
      else {
        this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"][targetElement[1].toString()] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterC"][targetElement[1].toString()].filter(element => element["KEY"] != targetElement[0].toString())
      }
    }
    else if (targetElement[1] == "FilterN") {
      this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["ADD"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["ADD"].filter(element => element["Filter"] != targetElement[0].toString())
      this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["REMOVE"] = this.possibleActions[this.selectedAmbiguity]["Action"]["FilterN"]["REMOVE"].filter(element => element["Filter"] != targetElement[0].toString())
    }

    var allKeys = Object.keys(this.possibleActions[this.selectedAmbiguity]["Action"])
    for (var i = 0; i < allKeys.length; i++) {
      if (!((Object.keys(this.possibleActions[this.selectedAmbiguity]["Action"][allKeys[i]]).includes("ADD") && this.possibleActions[this.selectedAmbiguity]["Action"][allKeys[i]]["ADD"].length > 0) || (Object.keys(this.possibleActions[this.selectedAmbiguity]["Action"][allKeys[i]]).includes("REMOVE") && this.possibleActions[this.selectedAmbiguity]["Action"][allKeys[i]]["REMOVE"].length > 0))) {
        delete this.possibleActions[this.selectedAmbiguity]["Action"][allKeys[i]]
      }

    }
  }


  checkSize(object) {
    return Object.keys(object).length
  }



}







