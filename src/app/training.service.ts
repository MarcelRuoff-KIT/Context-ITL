import { Injectable } from '@angular/core';

@Injectable()
export class TrainingService {

  constructor() { }

  public initialVisualizationState : any = {}

  public possibleActions = [{ "Action": {}, "ID":0, "Score": 0 }, { "Action": {}, "ID":0, "Score": 1 }, { "Action": {}, "ID":0, "Score": 2 }, { "Action": {}, "ID":0, "Score": 3 }, { "Action": {}, "ID":0, "Score": 4 }, { "Action": {}, "ID":0, "Score": 5 }]
  public baseAction = { "Action": {}, "ID":0, "Score": 0 }
  public selectedAmbiguity = 0
  public verbs = ["ADD", "REMOVE"]

  initializeTraining(that, possibleActions) {
    this.selectedAmbiguity = 1
    this.initialVisualizationState = JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState))

    this.possibleActions = possibleActions

    this.possibleActions.unshift(this.baseAction)

    var index = 0
    this.possibleActions.forEach(element => {
      that.visCanvas.possibleVisualizationStates.push(JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)))
      that.infoVisInteraction.processAction(that, that.visCanvas.possibleVisualizationStates[element["ID"]], element["Action"], false)

      that.visCanvas.createVisualization(that, that.visCanvas.possibleVisualizationStates[element["ID"]], "#Ambiguity_" + element["ID"], "small")
      index++
    })
    if (index > 0) {
      that.visCanvas.currentVisualizationState = that.visCanvas.possibleVisualizationStates[1]

      that.nlg.initializeUnderstandingDisplay(that, this.possibleActions[1]["Action"])
    }


    console.log(that.visCanvas.possibleVisualizationStates)
  }

  createVisualizations(that) {

  }


  adaptActionList(that, visualizationState, key, verb, elements) {

    var integralAction = {}
    var refinedActionList = this.possibleActions[this.selectedAmbiguity]["Action"]

    if (key == "VISUALIZATION") {
      integralAction = refinedActionList[key]
      if (typeof (integralAction) == "undefined") {
        integralAction = { "ADD": [], "REMOVE": [] }
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
              integralAction[this.verbs.filter(element => element != verb)[0]] = integralAction[this.verbs.filter(element => element != verb)[0]].filter(id => id != element)
            }
            else {
              if (key != "Filter") {
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
          elements.forEach(element => {
            if (integralAction[this.verbs.filter(element => element != verb)[0]].includes(element)) {
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

      if(current.length > 0 && current[0]["ID"].length > 0){
        integralAction[verb].push(current[0])
      }
      if(opposit.length > 0 && opposit[0]["ID"].length > 0){
        integralAction[this.verbs.filter(element => element != verb)[0]].push(opposit[0])
      }





      refinedActionList[key] = integralAction
    }
    else if(key == "FilterN"){
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

      if(originalGT != newGT && originalLT != newLT){
        verb = "ADD"
        add = {"Filter": id, "GT": newGT, "LT": newLT}
      }
      else if(originalGT > newGT){
        verb = "ADD"
        if(newLT == that.visCanvas.maxList[id][that.visCanvas.currentVisualizationState["Aggregate"][id]]){
          add = {"Filter": id, "GT": newGT}
        }
        else{
          add = {"Filter": id, "GT": newGT, "LT": newLT}
        }
      }
      else if(originalGT < newGT){
        verb = "REMOVE"
        remove = {"Filter": id, "LT": newGT}
      }
      else if(originalLT < newLT){
        verb = "ADD"
        if(newGT == 0){
          add = {"Filter": id, "LT": newLT}
        }
        else{
          add = {"Filter": id, "GT": newGT, "LT": newLT}
        }
      }
      else if(originalLT > newLT){
        verb = "REMOVE"
        remove = {"Filter": id, "GT": newLT}
      }


      integralAction["ADD"] = integralAction["ADD"].filter(element => element["Filter"] != id)

      integralAction["REMOVE"] = integralAction["REMOVE"].filter(element => element["Filter"] != id)

      if(add != null){
        integralAction["ADD"].push(add)

      }
      if(remove != null){
        integralAction["REMOVE"].push(remove)
      }

      refinedActionList[key] = {  [this.verbs.filter(element => element != verb)[0]]:integralAction[this.verbs.filter(element => element != verb)[0]], [verb]: integralAction[verb]}

      console.log(refinedActionList[key])
    }


    that.nlg.initializeUnderstandingDisplay(that, refinedActionList)
    that.visCanvas.createVisualization(that, visualizationState, "#Ambiguity_" + this.selectedAmbiguity, "small")

  }




}






