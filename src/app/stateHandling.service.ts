import { Injectable } from '@angular/core';

@Injectable()
export class StateHandlingService {

  constructor() { }

  public stateHistory: any = []
  public activeElement = 0
  public undoAvailable: boolean = false
  public redoAvailable: boolean = false
  public speechID = 0


  public resetStateHistory(that){
    if(that.overallMode == 0){
      this.stateHistory = [{"VisState": JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)), 'SelectedAmbiguity': JSON.parse(JSON.stringify(that.training.selectedAmbiguity)), 'ActionList': JSON.parse(JSON.stringify(that.training.possibleActions[that.training.selectedAmbiguity])), "Origin": "Mouse"}]
    }
    else{
      this.stateHistory = [{"VisState": JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)), 'SelectedAmbiguity': null, 'ActionList': null, "Origin": "Mouse"}]
    }
    this.undoAvailable = false
    this.redoAvailable = false
    this.activeElement = 0
  }

  public addAction(that, origin){
    this.activeElement += 1
    this.stateHistory.splice(this.activeElement)
    if(that.overallMode == 0){
      this.stateHistory.push({"VisState": JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)), 'SelectedAmbiguity': JSON.parse(JSON.stringify(that.training.selectedAmbiguity)), 'ActionList': JSON.parse(JSON.stringify(that.training.possibleActions[that.training.selectedAmbiguity])), "Origin": origin})
    }
    else if(origin == 'Mouse'){
      this.stateHistory.push({"VisState": JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)), 'SelectedAmbiguity': null, 'ActionList': null, "Origin": origin})
    }
    else if(origin == 'Speech'){
      this.speechID += 1
      this.stateHistory.push({"VisState": JSON.parse(JSON.stringify(that.visCanvas.currentVisualizationState)), 'SelectedAmbiguity': null, 'ActionList': null, "Origin": origin, "ID": this.speechID})
    }
    
    if(origin == 'Mouse'){
      that.lastSpeechInteraction = {}
    }

    if(this.stateHistory.length >= 2){
      this.undoAvailable = true
    }
    this.redoAvailable = false
  }

  public undo(that){
    if(this.activeElement > 0){
    this.activeElement -= 1
    
    that.visCanvas.currentVisualizationState = JSON.parse(JSON.stringify(this.stateHistory[this.activeElement]["VisState"]))


    if(that.overallMode == 0){
      that.training.selectedAmbiguity = JSON.parse(JSON.stringify(this.stateHistory[this.activeElement]["SelectedAmbiguity"]))
      that.training.possibleActions[that.training.selectedAmbiguity] = JSON.parse(JSON.stringify(this.stateHistory[this.activeElement]["ActionList"]))

      that.visCanvas.createVisualization(that, that.visCanvas.currentVisualizationState, "#Ambiguity_" + that.training.selectedAmbiguity, "small")
    }
    

    if(this.activeElement == 0){
      this.undoAvailable = false
    }
    this.redoAvailable = true

    that.visCanvas.createVisualization(that, that.visCanvas.currentVisualizationState, "#vis", "large");
    that.nlg.initializeUnderstandingDisplay(that, that.training.possibleActions[that.training.selectedAmbiguity]["Action"])

  }
  }

  public redo(that){
    if(this.activeElement < this.stateHistory.length -1){
    this.activeElement += 1

    if(that.overallMode == 0){
      that.training.selectedAmbiguity = JSON.parse(JSON.stringify(this.stateHistory[this.activeElement]["SelectedAmbiguity"]))
      that.training.possibleActions[that.training.selectedAmbiguity] = JSON.parse(JSON.stringify(this.stateHistory[this.activeElement]["ActionList"]))
    }
    
    that.visCanvas.currentVisualizationState = JSON.parse(JSON.stringify(this.stateHistory[this.activeElement]["VisState"]))

    if(this.activeElement == this.stateHistory.length -1){
      this.redoAvailable = false
    }
    this.undoAvailable = true

    that.visCanvas.createVisualization(that, that.visCanvas.currentVisualizationState, "#vis", "large");
    that.nlg.initializeUnderstandingDisplay(that, that.training.possibleActions[that.training.selectedAmbiguity]["Action"])

  }
  }




}







