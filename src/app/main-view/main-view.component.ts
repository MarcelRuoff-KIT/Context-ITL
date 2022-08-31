import { AfterContentInit, AfterViewInit, AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { InfoVisInteractionService } from "../info-vis-interaction.service";
import { TrainingService } from "../training.service";
import { NLGeneration } from "../NLGeneration.service";
import {ContextCheckerService} from "../contextChecker.service"
import { VisualizationCanvasComponent } from '../visualization-canvas/visualization-canvas.component';
import { style } from '@angular/animations';

declare global {
  interface Window {
    WebChat: any;
  }
}

interface Entity {
  label: string
}

interface Item {
  label: string,
  value: string
}

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  providers: [MessageService]
})
export class MainViewComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked {

  @ViewChild('visCanvas', { static: true }) visCanvas: VisualizationCanvasComponent;
  @ViewChild("botWindow", { static: true }) botWindowElement: ElementRef;


  constructor(
    private infoVisInteraction: InfoVisInteractionService,
    public training: TrainingService,
    private nlg: NLGeneration,
    private messageService: MessageService,
    private contextCh: ContextCheckerService
  ) { }

  public refreshInterval;
  public hoverInterval;

  //Conversational Agent
  public awaitingMessage = false;
  public displayDialog = false;
  public positionDialog = "right"
  public chatbotMessage = ""
  public directLine: any;
  public store: any;
  public componentMessage = null;
  public messengerID = null;
  public animate = false;
  public noSpeechInteraction = true;

  public conversationHistory = false

  public overallMode = 2;
  public correctionMode = false;
  public editMode = false;
  public compareMode = false;

  availableProducts = [];


  checked1: boolean = false;

  filteredDataFields: string[] = []

  selectedDataFields: string[] = []

  errorCounter = 0;


  draggedDatafield: any = null;
  currentTarget: any = ""

  //Training Mode
  blockedAction = false
  trainingMode = false
  currentReasoningTargetHover = ""
  targetElement: HTMLElement;

  checked: boolean = false;

  action = {
    "VISUALIZATION": { "ADD": ["point"], "REMOVE": [] },
    "x-Axis": { "ADD": ["Energy Type"], "REMOVE": [] },
    "Values": { "ADD": ["Amount", "Projects"], "REMOVE": ["ALL"] },
    "Color": { "ADD": ["State"], "REMOVE": [] },
    "Aggregate": { "ADD": [{ "KEY": "ALL", "ID": "max" }], "REMOVE": [] },

    "Highlight": { "ADD": ["Amount"], "REMOVE": [] },
    "ColorHighlight": { "ADD": ["Florida", "New York"], "REMOVE": [] },
    "Filter": { "ADD": [], "REMOVE": ["ALL"] },

    "FilterC": { "ADD": [{ "KEY": "State", "ID": ["ALL"] }], "REMOVE": [{ "KEY": "Energy Type", "ID": ["Solar", "Wind"] }] },
    "FilterN": { "ADD": [{ "Filter": "Projects", "GT": '500', "LT": "1000" }], "REMOVE": [] }
  }






  activeFilterAcc: { [characterName: string]: boolean } = {

    "Energy Type": true,
    "State": true,
    "Party of Governor": true,
    "Investment Type": true,
    "Year": true,
    "Projects": true,
    "Amount": true,
  }


  ngOnInit(): void {




    this.visCanvas.currentVisualizationState['Datafields'] = [];

    this.directLine = window.WebChat.createDirectLine({
      secret: "I9zWGr48ptY.a56vpsiJsI-8omBWyUGKSSNoEkrotfvYVxFWLCWVgDc",
      webSocket: false
    });

    this.store = window.WebChat.createStore(
      {},
      ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          //connect outgoing event handler and hand over reported data
          const event = new Event('webchatoutgoingactivity');
          //action.payload.activity.channelData = { Visualizations: this.unitedStatesMap.chartType, Legend: this.unitedStatesMap.legend_Values ? this.unitedStatesMap.legend_Values : null, DataFields: this.unitedStatesMap.y_Axis_Values, Task: this.task, Treatment: this.treatment, UserID: this.userID };
          var find = '([0-9]),([0-9])';
          var re = new RegExp(find, 'g');
          action.payload.activity.text = String(action.payload.activity.text).replace(re, '$1$2');
          (<any>event).data = action.payload.activity;
          window.dispatchEvent(event);
        }
        else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const event = new Event('webchatincomingactivity');
          (<any>event).data = action.payload.activity;
          if ((<any>event).data["type"] == "message") {
            (<any>event).data["timestamp"] = ""
          }
          window.dispatchEvent(event);

          if ((<any>event).data["type"] != "message" || (<any>event).data["text"] != "Processing...") {

          }

        }
        return next(action);
      });


    window.WebChat.renderWebChat(
      {
        directLine: this.directLine,
        sendTypingIndicator: true,
        sendTyping: true,
        styleOptions: {
          botAvatarBackgroundColor: 'rgba(0, 0, 0)',
          hideUploadButton: true,
          bubbleBorderWidth: 0,
          bubbleBackground: '#e6e2e27a',
          bubbleFromUserBorderWidth: 0,
          bubbleFromUserBorderColor: 'black',
          sendBoxButtonColor: 'rgba(255,153, 0, 1)',
          sendBoxButtonColorOnFocus: 'rgba(255,153, 0, 1)',
          sendBoxButtonColorOnHover: 'rgba(255,153, 0, 1)',
          sendBoxHeight: 30,
          bubbleMinHeight: 0,
          bubbleMaxWidth: 450,
          paddingRegular: 5,
          suggestedActionHeight: 30
        },
        locale: 'en-US',
        store: this.store,
        overrideLocalizedStrings: {
          TEXT_INPUT_PLACEHOLDER: 'Please type the command you want to perform...'//'Click on the microphone and speak OR type ...'
        }

      },
      this.botWindowElement.nativeElement

    );

    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large")

  }

  ngOnChanges(): void {
    var target = document.getElementById("Datafields")
    console.log(target)
  }

  public ngAfterViewInit(): void {
    window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    document.addEventListener('mousemove', this.hoverTargetElement.bind(this))

  }

  public ngAfterViewChecked(): void {
    for(var i = 0; i < this.visCanvas.dataFields.length; i++){
      var element = document.getElementById("Datafield_" + this.visCanvas.dataFields[i])
      if(element["tagName"] == "DIV"){
        element.parentElement.id = element.id
        element.id = ""
      }
    }
  }



  public ngAfterContentInit() {
    /**Chat Interface Manipulation */
    $("form[class^='webchat__send-box-text-box']").first().css("border", "1px solid black")
    $("div[class^='webchat__basic-transcript']").first().css("display", "none")
    $("div[class^='webchat__basic-transcript']").first().css("border", "1px solid #0000b9")
    $("div[class^='webchat__basic-transcript']").first().css("border-radius", "10px 10px 0px 0px")


    $("div[class^='webchat__basic-transcript__filler']").first().css("display", "none")
    $("div[class^='react-scroll-to-bottom']").first().css("height", "fit-content")

    this.initialize();

    document.onclick = this.getTargetElement.bind(this)



  }

  putTargetElement(id) {
    var element = document.getElementById(id)
    var target = document.getElementById(id)
    if (id != this.currentReasoningTargetHover) {
      let offsetTop = -3;
      let offsetLeft = -3;
      let scrollTop = 0;

      var parent = element['parentElement']
      while (parent) {
        scrollTop += parent['scrollTop']
        parent = parent['parentElement']
      }

      while (element) {
        offsetTop += element['offsetTop'];
        offsetLeft += element['offsetLeft'];
        element = <HTMLElement>element['offsetParent'];
      }




      var suggestion = document.getElementById('suggestion')
      suggestion['style']["display"] = 'flex'
      suggestion['style']["width"] = '' + (target['offsetWidth'] + 21) + 'px'
      suggestion['style']["height"] = '' + (target['offsetHeight'] + 6) + 'px'
      suggestion['style']["top"] = '' + (offsetTop - scrollTop) + 'px'
      suggestion['style']["left"] = '' + offsetLeft + 'px'
    }

  }

  getTargetElement(event) {
    if (this.overallMode == 1 && !this.blockedAction) {
      var allElements = <HTMLElement[]> document.elementsFromPoint(event.x, event.y)
      var triggers =  allElements.filter(element => { return element["className"] != null && element["nodeName"] != "svg" && element["className"].includes("p-multiselect-trigger") && element["tagName"] == "DIV" })
      
      if(allElements.some(element => element["className"] != null && element["nodeName"] != "svg" && element["className"].includes("ng-trigger-overlayAnimation")))
      {

      }
      else if (triggers.length > 0) {
        triggers[0].click()
      }
      else {
        var target = allElements.filter(element => { return element.id != '' && element.id != 'interactionBlocker' && element.id != 'targetHover' && element.id != 'suggestion' && element.id != 'visCanvas' && element.id != 'visGrid'})

        if (target.length > 0 && !target.some(id => id.id == "nlClarification") && !target.some(id => id.id == "displayConstraints") && !target.some(id => id.id == "displayAmbiguities") && !target.some(id => id.id == "acceptSuggestion") && !target.some(id => id.id == "declineSuggestion")) {
          var element = target[0]
          if (target[0]['id'] != this.currentReasoningTargetHover) {
            let offsetTop = -3;
            let offsetLeft = -3;
            let scrollTop = 0;

            var parent = element['parentElement']
            while (parent) {
              scrollTop += parent['scrollTop']
              parent = parent['parentElement']
            }

            while (element) {
              offsetTop += element['offsetTop'];
              offsetLeft += element['offsetLeft'];
              element = <HTMLElement>element['offsetParent'];
            }




            var suggestion = document.getElementById('suggestion')
            suggestion['style']["display"] = 'flex'
            suggestion['style']["width"] = '' + (target[0]['offsetWidth'] + 21) + 'px'
            suggestion['style']["height"] = '' + (target[0]['offsetHeight'] + 6) + 'px'
            suggestion['style']["top"] = '' + (offsetTop - scrollTop) + 'px'
            suggestion['style']["left"] = '' + offsetLeft + 'px'
          }
        }
        else {
          var suggestion = document.getElementById('suggestion')
          //suggestion['style']["display"] = 'none'
        }
      }

    }

    this.blockedAction = false

  }

  hoverTargetElement(event) {
    if (this.overallMode == 1 && !this.blockedAction) {
      var allElements = <HTMLElement[]> document.elementsFromPoint(event.x, event.y)
      var triggers =  allElements.filter(element => { return element["className"] != null && element["nodeName"] != "svg" && element["className"].includes("p-multiselect-trigger") && element["tagName"] == "DIV" })
      
      if(allElements.some(element => element["className"] != null && element["nodeName"] != "svg" &&  element["className"].includes("ng-trigger-overlayAnimation")))
      {

      }
      else if (triggers.length > 0) {
        triggers[0].click()
      }
      else {
      var target = document.elementsFromPoint(event.x, event.y);
      target = target.filter(element => { return element.id != '' && element.id != 'interactionBlocker' && element.id != 'targetHover' && element.id != 'suggestion' && element.id != 'visCanvas' && element.id != 'visGrid'})
      if (target.length > 0 && !target.some(id => id.id == "nlClarification") && !target.some(id => id.id == "displayConstraints") && !target.some(id => id.id == "displayAmbiguities") && !target.some(id => id.id == "acceptSuggestion") && !target.some(id => id.id == "declineSuggestion")) {
        var element = target[0]
        if (target[0]['id'] != this.currentReasoningTargetHover) {
          let offsetTop = -3;
          let offsetLeft = -3;
          let scrollTop = 0;

          var parent = element['parentElement']
          while (parent) {
            scrollTop += parent['scrollTop']
            parent = parent['parentElement']
          }

          while (element) {
            offsetTop += element['offsetTop'];
            offsetLeft += element['offsetLeft'];
            element = element['offsetParent'];
          }




          var targetHover = document.getElementById('targetHover')
          targetHover['style']["display"] = 'block'
          targetHover['style']["width"] = '' + (target[0]['offsetWidth'] + 6) + 'px'
          targetHover['style']["height"] = '' + (target[0]['offsetHeight'] + 6) + 'px'
          targetHover['style']["top"] = '' + (offsetTop - scrollTop) + 'px'
          targetHover['style']["left"] = '' + offsetLeft + 'px'
        }
      }
      else {
        var targetHover = document.getElementById('targetHover')
        targetHover['style']["display"] = 'none'
      }
    }
    }
  }

  acceptSuggestion(event) {

  }

  declineSuggestion(event) {
    this.blockedAction = true
    document.getElementById('suggestion')["style"]["display"] = "none"
  }

  searchSuggestion(event) {
    this.blockedAction = true
    this.putTargetElement("Color_Constraint")
  }

  initialize() {

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {


      //$("div[class^='webchat__basic-transcript']").first().css("display", "none")


      document.getElementById("Canvas_Axis-0")["style"]["display"] = "none"
      document.getElementById("Canvas_Axis-1")["style"]["display"] = "none"

      var axis = document.getElementsByClassName("role-axis");
      var counter = 0;
      for (var i = 0; i < axis.length; i++) {

        if (axis[i]["ariaLabel"] != null ) {
          var bounds = axis[i].getBoundingClientRect()

          var element = document.getElementById("Canvas_Axis-" + counter)

          if(axis[i]["ariaLabel"].startsWith("X-axis")){
            element = document.getElementById("Canvas_x-Axis")
          }

          element["style"]["display"] = "block"
          element["style"]["top"] = bounds.top.toString() + "px"
          element["style"]["left"] = bounds.left.toString() + "px"
          element["style"]["width"] = bounds.width.toString() + "px"
          element["style"]["height"] = bounds.height.toString() + "px"
          counter++
        }
      }

      if (this.errorCounter > 0) {
        this.errorCounter -= 1
      }
      else {
        document.getElementById("errorMessage")["style"]["display"] = "none"
      }

    }, 1000)

  }

  receiveData(data: any) {
    console.log(data)
  }

  public async webChatHandler(event) {



    if (event["data"]["from"]["role"] == 'bot' && event["data"]["type"] == "message") {
      this.displayDialog = true;

      if (!this.correctionMode) {
        document.getElementById("botMessage").innerHTML = ""
      }
      this.chatbotMessage = event["data"]["text"]

    }
    if (event["data"]["from"]["role"] == 'bot' && event["data"]["type"] == "event") {
      if (event["data"]["name"] == "Start Demonstration") {
        await this.startDemonstration(event["data"]["value"]["Content"], event["data"]["value"]["Entities"])
      }
      else if (event["data"]["name"] == "PerformNLI") {
        event["data"]["value"]["Content"]["Action"].forEach(action => {
          this.infoVisInteraction.processAction(this, this.visCanvas.currentVisualizationState, action, true, null)
        })
        this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
      }
      else if (event["data"]["name"] == "finishedProcess") {
        this.awaitingMessage = false;
      }
    }
    else if (event["data"]["from"]["role"] == 'user' && event["data"]["type"] == "message") {
      $(".webchat__send-box-text-box__input").attr("placeholder", "Current NL input: " + event["data"]["text"])
      this.awaitingMessage = true;
    }



  }

  async startDemonstration(possibleActions, entities) {
    this.correctionMode = true
    this.training.initialEntities = entities
    await this.training.initializeTraining(this, possibleActions)
    await this.adaptVisualizationSize(0)

  }

  async continueDemonstration() {
    this.correctionMode = false
    this.visCanvas.mode = 'past'

    this.displayDialog = true;
    this.chatbotMessage = "Thank you for specifying the visual elements that are crucial for understanding your interpretation of the NL Input. \r\n You are now seeing the state of the data visualization tool before performing the NL input. \r\n I have highlighted some visual elements that I think could be relevant!"

    this.visCanvas.currentVisualizationState = this.training.initialVisualizationState

    await this.adaptVisualizationSize(1)

    this.putTargetElement("Year_temporal")
  }

  endDemonstration(finished) {
    this.visCanvas.mode = 'current'

    this.adaptVisualizationSize(2)

    if (finished) {
      this.messageService.add({ severity: 'success', summary: 'New NL input', detail: 'You have successfully trained a new NL input.' });

      this.directLine
        .postActivity({
          from: { id: "USER_ID", name: "USER_NAME" },
          name: "endTrainingMode",
          type: "event",
          value: {
            'sequence': this.training.possibleActions[this.training.selectedAmbiguity]["Action"],
            'initialState': this.training.initialVisualizationState
          }
        })
        .subscribe(
          id => {
            if (sessionStorage.getItem('conversationID') == null) {
              sessionStorage.setItem('conversationID', this.directLine.conversationId);
            };
          },
          error => console.log(`Error posting activity ${error}`)
        );
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Training Canceled', detail: 'You have canceled the training.' });

      this.directLine
        .postActivity({
          from: { id: "USER_ID", name: "USER_NAME" },
          name: "cancelTrainingMode",
          type: "event",
        })
        .subscribe(
          id => {
            if (sessionStorage.getItem('conversationID') == null) {
              sessionStorage.setItem('conversationID', this.directLine.conversationId);
            };
          },
          error => console.log(`Error posting activity ${error}`)
        );
    }

    /*window.removeEventListener('click', this.clickHighlight, false)
    window.removeEventListener('mouseover', this.mousoverHighlight, false)
    window.removeEventListener('mouseout', this.mouseoutHighlight, false)*/


  }

  async adaptVisualizationSize(target) {
    this.overallMode = target


    if (target == 0) {
      document.getElementById("displayAmbiguities")["style"]["display"] = "block"
      document.getElementById("visGrid")["style"]["height"] = "50%"
      document.getElementById("visCanvas")["className"] = "col-6 col-offset-1"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "block"
      document.getElementById("submitButton")["style"]["display"] = "flex"
      document.getElementById("continueButton")["style"]["display"] = "flex"
      document.getElementById("cancelButton")["style"]["display"] = "flex"

    }
    else if (target == 1) {
      document.getElementById("displayConstraints")["style"]["display"] = "block"
      document.getElementById("displayAmbiguities")["style"]["display"] = "none"
      document.getElementById("visGrid")["style"]["height"] = "60%"

      document.getElementById("visCanvas")["className"] = "col-12"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "none"
      document.getElementById("continueButton")["style"]["display"] = "none"
      document.getElementById("submitButton")["style"]["display"] = "flex"


    }

    else {
      document.getElementById("displayAmbiguities")["style"]["display"] = "none"
      document.getElementById("displayConstraints")["style"]["display"] = "none"
      document.getElementById("visGrid")["style"]["height"] = "80%"
      document.getElementById("visCanvas")["className"] = "col-12"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "none"
      document.getElementById("continueButton")["style"]["display"] = "none"
      document.getElementById("submitButton")["style"]["display"] = "none"
      document.getElementById("cancelButton")["style"]["display"] = "none"
      document.getElementById('suggestion')["style"]["display"] = "none"

    }

    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  extendActionSequence(event) {

    if (event["currentTarget"]["children"][0]["style"]["display"] == "block") {
      /** Open Sub */
      event["currentTarget"]["children"][0]["style"]["display"] = "none"
      event["currentTarget"]["children"][1]["style"]["display"] = "block"

      event["currentTarget"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["children"][1]["style"]["display"] = "block"
    }
    else {
      /** Close Sub */
      event["currentTarget"]["children"][0]["style"]["display"] = "block"
      event["currentTarget"]["children"][1]["style"]["display"] = "none"

      event["currentTarget"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["parentElement"]["children"][1]["style"]["display"] = "none"

    }
  }

  async changeAmbiguitySelect(event, ambiguity) {
    event.preventDefault();

    this.training.selectedAmbiguity = ambiguity

    this.visCanvas.possibleVisualizationStates[ambiguity] = await this.training.changeAmbiguityInterpretation(this, this.training.possibleActions[ambiguity])

    this.visCanvas.currentVisualizationState = this.visCanvas.possibleVisualizationStates[ambiguity]

    this.nlg.initializeUnderstandingDisplay(this, this.training.possibleActions[ambiguity]["Action"])

    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  changeAmbiguityCompare(event, ambiguity) {
    this.compareMode = !this.compareMode
  }

  changeEditMode(event) {
    if (event.checked) {
      var verbs = document.getElementsByClassName('verb');
      for (var i = 0; i < verbs.length; i++) {
        verbs[i]["style"].display = 'none';
      }

      var selects = document.getElementsByClassName('selectField');
      for (var i = 0; i < selects.length; i++) {
        selects[i]["style"].display = 'inline';
      }

      var closeButton = document.getElementsByClassName('closeButton');
      for (var i = 0; i < closeButton.length; i++) {
        closeButton[i]["style"].display = 'flex';
      }
    }
    else {
      var verbs = document.getElementsByClassName('verb');
      for (var i = 0; i < verbs.length; i++) {
        verbs[i]["style"].display = '';
      }

      var selects = document.getElementsByClassName('selectField');
      for (var i = 0; i < selects.length; i++) {
        selects[i]["style"].display = 'none';
      }

      var closeButton = document.getElementsByClassName('closeButton');
      for (var i = 0; i < closeButton.length; i++) {
        closeButton[i]["style"].display = 'none';
      }
    }
  }

  async closeITLElement(event) {
    await this.training.removeAction(this, event.currentTarget.parentElement.parentElement.parentElement.id.split("_"))

    this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity] = await this.training.changeAmbiguityInterpretation(this, this.training.possibleActions[this.training.selectedAmbiguity])

    this.visCanvas.currentVisualizationState = this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity]

    await this.nlg.initializeUnderstandingDisplay(this, this.training.possibleActions[this.training.selectedAmbiguity]["Action"])

    await this.visCanvas.createVisualization(this, this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity], "#Ambiguity_" + this.training.selectedAmbiguity, "small")

    await this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  showHistory(event) {
    if (event.checked) {
      var sheight = document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollHeight;
      document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollTo({ left: 0, top: sheight, behavior: 'auto' });
      document.getElementById("botMessage")["style"]["z-index"] = "-1"

      $("div[class^='webchat__basic-transcript']").first().css("display", "flex")
    }
    else {
      $("div[class^='webchat__basic-transcript']").first().css("display", "none")
      document.getElementById("botMessage")["style"]["z-index"] = "1"

    }
  }

  mouseChange(event, state) {
    /*
    if (this.draggedDatafield != null) {
      if (state == "enter") {
        this.currentTarget = event["currentTarget"]["id"]
        event["currentTarget"]["style"]["backgroundColor"] = "#a6192e2e"
      }
      else if (state == "leave" && this.currentTarget != "" ) {
        document.getElementById(this.currentTarget)["style"]["backgroundColor"] = ""
      }
    }
      */
  }




  dragStart(event: any, dataField: string) {
    this.draggedDatafield = dataField;
  }

  dragEnd() {
    if (this.currentTarget != "") {
      document.getElementById(this.currentTarget)["style"]["backgroundColor"] = ""
      this.currentTarget = ""
    }

    this.draggedDatafield = null;
  }

  async drop(event: any, target: string) {

    if (this.draggedDatafield) {
      if (target == "xAxis") {
        await this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true, null)
      }
      else if (target == "values") {
        await this.infoVisInteraction.addValues(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true, null)
      }
      else if (target == "color") {
        await this.infoVisInteraction.addLegends(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true, null)
      }
      else if (target == "filter") {
        await this.infoVisInteraction.openingFilters(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true, null)
      }

      this.draggedDatafield = null;
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async select(event: any, target: string) {
    if (target == "xAxis") {
      await this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    else if (target == "values") {
      await this.infoVisInteraction.addValues(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    else if (target == "color") {
      await this.infoVisInteraction.addLegends(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async unselect(event: any, target: string) {
    if (target == "xAxis") {
      await this.infoVisInteraction.removeXAxis(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    else if (target == "values") {
      await this.infoVisInteraction.removeValues(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    else if (target == "color") {
      await this.infoVisInteraction.removeLegends(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }





  search(event: any) {
    this.filteredDataFields = this.visCanvas.dataFields.filter(c => c.toLowerCase().startsWith(event.query.toLowerCase()));
  }

  async checkTarget(event: any) {
    if (event.value.includes(event.option)) {
      this.visCanvas.currentVisualizationState["Datafields"] = event.value.filter(element => element != event.option)
      if (this.visCanvas.dataFieldsConfig[event.option] == "quantitative") {
        await this.infoVisInteraction.addValues(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
      else if (this.visCanvas.currentVisualizationState['x-Axis'].length == 0) {
        await this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
      else if (this.visCanvas.currentVisualizationState['Color'].length == 0) {
        await this.infoVisInteraction.addLegends(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
      else {
        await this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
    }
    else {
      this.visCanvas.currentVisualizationState["Datafields"].push(event.option)
      if (this.visCanvas.currentVisualizationState['x-Axis'].includes(event.option)) {
        await this.infoVisInteraction.removeXAxis(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
      else if (this.visCanvas.currentVisualizationState['Values'].includes(event.option)) {
        await this.infoVisInteraction.removeValues(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
      else if (this.visCanvas.currentVisualizationState['Color'].includes(event.option)) {
        await this.infoVisInteraction.removeLegends(this, this.visCanvas.currentVisualizationState, [event.option], true, null)
      }
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async deleteFilter(event: any, target: any) {
    await this.infoVisInteraction.removeFilters(this, this.visCanvas.currentVisualizationState, [target], true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }


  async changeVisualizationMouse(target: string) {
    await this.infoVisInteraction.changeVisualization(this, this.visCanvas.currentVisualizationState, target, true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async changeAggregateMouse(event, target) {
    await this.infoVisInteraction.changeAggregate(this, this.visCanvas.currentVisualizationState, target, event.value, true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  showErrorMessage() {
    document.getElementById("errorMessage")["style"]["display"] = "block"
    this.errorCounter = 4
  }

  changeNumFilterMouse(event, target, boundary) {
    if (event.value != null) {
      var filter: any = { "Filter": target, [boundary]: event.value }
      var verb = "REMOVE"

      if (boundary == "LT" && event.value < this.visCanvas.currentVisualizationState["FilterN"][target][0]) {
        verb = "ADD"
        if (this.visCanvas.currentVisualizationState["FilterN"][target][1] == this.visCanvas.maxList[target][this.visCanvas.currentVisualizationState["Aggregate"][target]]) {
          filter = { "Filter": target, "GT": event.value }
        }
        else {
          filter = { "Filter": target, "GT": event.value, "LT": this.visCanvas.currentVisualizationState["FilterN"][target][1] }
        }
      }
      else if (boundary == "GT" && event.value > this.visCanvas.currentVisualizationState["FilterN"][target][1]) {
        verb = "ADD"
        if (this.visCanvas.currentVisualizationState["FilterN"][target][0] == 0) {
          filter = { "Filter": target, "LT": event.value }
        }
        else {
          filter = { "Filter": target, "LT": event.value, "GT": this.visCanvas.currentVisualizationState["FilterN"][target][0] }
        }
      }

      this.infoVisInteraction.changeNumFilter(this, this.visCanvas.currentVisualizationState, [filter], verb, true, null)
      this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    }

  }

  changeCatFilterMouse(event, target) {
    var filter = {
      "KEY": target, "ID": [event.itemValue]
    }
    if (typeof (event.itemValue) == "undefined" && event.value.length == 0) {
      this.infoVisInteraction.removeCatFilter(this, this.visCanvas.currentVisualizationState, [{ "KEY": target, "ID": ["ALL"] }], true, null)
    }
    else if (typeof (event.itemValue) == "undefined" && event.value.length > 1 && this.visCanvas.optionDictionary[target].every(item => event.value.includes(item["value"]))) {
      this.infoVisInteraction.addCatFilter(this, this.visCanvas.currentVisualizationState, [{ "KEY": target, "ID": ["ALL"] }], true, null)
    }
    else if (event.value.includes(event.itemValue)) {
      this.visCanvas.currentVisualizationState["FilterC"][target] = this.visCanvas.currentVisualizationState["FilterC"][target].filter(element => element != event.itemValue)
      this.infoVisInteraction.addCatFilter(this, this.visCanvas.currentVisualizationState, [filter], true, null)
    }
    else {
      this.visCanvas.currentVisualizationState["FilterC"][target].push(event.itemValue)
      this.infoVisInteraction.removeCatFilter(this, this.visCanvas.currentVisualizationState, [filter], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  changeActiveFilterMouse(event, target, boundary) {
    this.infoVisInteraction.changeActiveFilter(this, this.visCanvas.currentVisualizationState, target, boundary, event.checked, true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }


  handleChange(event: any, target: any) {
    if (this.visCanvas.currentVisualizationState['CheckedHighlight'][this.visCanvas.currentVisualizationState["Values"][target]] && this.visCanvas.currentVisualizationState["Values"].length > 1) {
      this.infoVisInteraction.removeAxisHighlight(this, this.visCanvas.currentVisualizationState, this.visCanvas.currentVisualizationState["Values"][target], true, null)
    }
    else if (this.visCanvas.currentVisualizationState["Values"].length > 1) {
      this.infoVisInteraction.addAxisHighlight(this, this.visCanvas.currentVisualizationState, this.visCanvas.currentVisualizationState["Values"][target], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  handleChangeStar(event: any, target: any) {
    if (this.visCanvas.currentVisualizationState['CheckedHighlight'][target]) {
      this.infoVisInteraction.removeAxisHighlight(this, this.visCanvas.currentVisualizationState, target, true, null)
    }
    else {
      this.infoVisInteraction.addAxisHighlight(this, this.visCanvas.currentVisualizationState, target, true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

}
