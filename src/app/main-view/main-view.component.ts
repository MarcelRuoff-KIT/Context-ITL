import { AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { InfoVisInteractionService } from "../info-vis-interaction.service";
import { TrainingService } from "../training.service";
import { NLGeneration } from "../NLGeneration.service";
import { VisualizationCanvasComponent } from '../visualization-canvas/visualization-canvas.component';

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
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit, AfterContentInit, AfterViewInit {

  @ViewChild('visCanvas', { static: true }) visCanvas: VisualizationCanvasComponent;
  @ViewChild("botWindow", { static: true }) botWindowElement: ElementRef;


  constructor(
    private infoVisInteraction: InfoVisInteractionService,
    public training: TrainingService,
    private nlg: NLGeneration
  ) { }

  public refreshInterval;

  //Conversational Agent
  public displayDialog = false;
  public chatbotMessage = ""
  public directLine: any;
  public store: any;
  public componentMessage = null;
  public messengerID = null;
  public animate = false;
  public noSpeechInteraction = true;

  public conversationHistory = false

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
  trainingMode = false
  activeIndex = 0

  items: MenuItem[] = [
    {
      label: "Specify Correct Understanding", command: (event: any) => {

        if (this.activeIndex == 1) {
          this.activeIndex = 1;
        }
        //this.messageService.add({ severity: 'info', summary: 'Seat Selection', detail: event.item.label });
      }
    },
    {
      label: "Highlight Relevant Context", command: (event: any) => {

        this.activeIndex = 1;
        //this.messageService.add({ severity: 'info', summary: 'Seat Selection', detail: event.item.label });
      }
    }];

  checked: boolean = false;

  actionAmbiguities = [1, 2]
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

  action2 = {
    "VISUALIZATION": { "ADD": ["line"], "REMOVE": [] },
    "x-Axis": { "ADD": ["Amount"], "REMOVE": [] },
    "Values": { "ADD": ["Projects"], "REMOVE": ["Amount"] },
    "Color": { "ADD": ["Energy Type"], "REMOVE": [] },
    "Highlight": { "ADD": ["Amount"], "REMOVE": [] },
    "ColorHighlight": { "ADD": ["Solar", "Wind"], "REMOVE": [] },
    "Filter": { "ADD": ["Amount"], "REMOVE": [] },
    "FilterC": { "ADD": [{ "KEY": "State", "ID": ["California", "Florida"] }, { "KEY": "Energy Type", "ID": ["ALL"] }], "REMOVE": [{ "KEY": "Energy Type", "ID": ["Solar", "Wind"] }, { "KEY": "State", "ID": ["ALL"] }] },
    "FilterN": { "ADD": [{ "Filter": "Projects", "GT": '500', "LT": "2000" }], "REMOVE": [] },
    "Aggregate": { "ADD": [{ "KEY": "Amount", "ID": "mean" }], "REMOVE": [] }
  }

  action3 = {
    "VISUALIZATION": { "ADD": ["bar"], "REMOVE": [] },
    "x-Axis": { "ADD": ["Amount"], "REMOVE": [] },
    "Values": { "ADD": ["Amount", "Projects"], "REMOVE": [] },
    "Color": { "ADD": ["Energy Type"], "REMOVE": [] },
    "Highlight": { "ADD": ["Amount"], "REMOVE": [] },
    "ColorHighlight": { "ADD": ["Solar", "Wind"], "REMOVE": [] },
    "Filter": { "ADD": ["Amount"], "REMOVE": [] },
    "FilterC": { "ADD": [{ "KEY": "State", "ID": ["ALL"] }], "REMOVE": [{ "KEY": "Energy Type", "ID": ["Solar", "Wind"] }] },
    "FilterN": { "ADD": [], "REMOVE": [{ "Filter": "Projects", "GT": '5000', "LT": "1000" }] },
    "Aggregate": { "ADD": [{ "KEY": "ALL", "ID": "mean" }], "REMOVE": [] }
  }
  //possibleActions = [{ "Action": this.action, "ID": 0 }, { "Action": this.action2, "ID": 1 }, { "Action": this.action3, "ID": 2 }, { "Action": {}, "ID": 3 }]
  possibleActions = [{ "Action": { "Aggregate": { "ADD": [{ "KEY": "Amount", "ID": "max" }], "REMOVE": [] }}, "ID": 1, "Score": 0.89 }, { "Action": { "Values": { "ADD": ["Amount"], "REMOVE": [] } }, "ID": 2, "Score": 0.85 }, { "Action": { "Highlight": { "ADD": ["Amount"], "REMOVE": [] } }, "ID": 3, "Score": 0.79 }]

  possibleActions2 = [{ "Action": { "ColorHighlight": { "ADD": ["Florida"], "REMOVE": [] }}, "ID": 1, "Score": 0.92 }, { "Action": { "FilterC": { "ADD": [{ "KEY": "State", "ID": ["Florida"] }], "REMOVE": [{ "KEY": "State", "ID": ["ALL"] }] } }, "ID": 2, "Score": 0.9 }]

  possibleActions3 = [{ "Action": { "ColorHighlight": { "ADD": ["Solar"], "REMOVE": [] }}, "ID": 1, "Score": 0.92 }, { "Action": { "FilterC": { "ADD": [{ "KEY": "Energy Type", "ID": ["Solar"] }], "REMOVE": [{ "KEY": "Energy Type", "ID": ["ALL"] }] } }, "ID": 2, "Score": 0.9 }]



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

  public ngAfterViewInit(): void {
    window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
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



  }

  initialize() {

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {


      //$("div[class^='webchat__basic-transcript']").first().css("display", "none")


      document.getElementById("Axis-0")["style"]["display"] = "none"
      document.getElementById("Axis-1")["style"]["display"] = "none"

      var axis = document.getElementsByClassName("role-axis");
      var counter = 0;
      for (var i = 0; i < axis.length; i++) {

        if (axis[i]["ariaLabel"] != null && axis[i]["ariaLabel"].startsWith("Y-axis")) {
          var bounds = axis[i].getBoundingClientRect()

          var element = document.getElementById("Axis-" + counter)
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



    if(event["data"]["from"]["role"] == 'bot' && event["data"]["type"] == "message"){
      this.displayDialog = true;

      if (!this.correctionMode) {
        if(event["data"]["text"].toLowerCase() == "show max amount invested"){
          await this.startDemonstration(this.possibleActions)
  
        }
        else if(event["data"]["text"].toLowerCase() == "get me solar"){
          await this.startDemonstration(this.possibleActions3)
  
        }
        else if(event["data"]["text"].toLowerCase() == "get me florida"){
          await this.startDemonstration(this.possibleActions2)
  
        }
        document.getElementById("botMessage").innerHTML = ""
  
      }
      this.chatbotMessage = "<b> hallo </b>"//event["data"]["text"]

    }
    else if(event["data"]["from"]["role"] == 'user' && event["data"]["type"] == "message"){
      $(".webchat__send-box-text-box__input").attr("placeholder", "Current NL input: " + event["data"]["text"])
    }
    

    
  }

  async startDemonstration(possibleActions){
    this.correctionMode = true
    await this.training.initializeTraining(this, possibleActions)
    await this.adaptVisualizationSize(0)

  }

  async continueDemonstration(){
    this.correctionMode = false
    this.visCanvas.mode = 'past'
    /*window.addEventListener('click', this.clickHighlight.bind(this), false)
    window.addEventListener('mouseover', this.mousoverHighlight.bind(this), false)
    window.addEventListener('mouseout', this.mouseoutHighlight.bind(this), false)*/
    this.visCanvas.currentVisualizationState = this.training.initialVisualizationState

    await this.adaptVisualizationSize(1)
  }

  endDemonstration(finished){
    this.visCanvas.mode = 'current'

    this.adaptVisualizationSize(2)

    /*window.removeEventListener('click', this.clickHighlight, false)
    window.removeEventListener('mouseover', this.mousoverHighlight, false)
    window.removeEventListener('mouseout', this.mouseoutHighlight, false)*/
    
    
  }

  async adaptVisualizationSize(target) {


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

    else{
      document.getElementById("displayAmbiguities")["style"]["display"] = "none"
      document.getElementById("displayConstraints")["style"]["display"] = "none"
      document.getElementById("visGrid")["style"]["height"] = "80%"
      document.getElementById("visCanvas")["className"] = "col-12"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "none"
      document.getElementById("continueButton")["style"]["display"] = "none"
      document.getElementById("submitButton")["style"]["display"] = "none"
      document.getElementById("cancelButton")["style"]["display"] = "none"

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
    else{
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
    console.log(event)

  }

  mouseChange(event, state) {
    /*
    if (this.draggedDatafield != null) {
      console.log(state)

      console.log(event["currentTarget"]["id"])

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
        await this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true)
      }
      else if (target == "values") {
        await this.infoVisInteraction.addValues(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true)
      }
      else if (target == "legend") {
        await this.infoVisInteraction.addLegends(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true)
      }
      else if (target == "filter") {
        await this.infoVisInteraction.openingFilters(this, this.visCanvas.currentVisualizationState, [this.draggedDatafield], true)
      }

      this.draggedDatafield = null;
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async select(event: any, target: string) {
    if (target == "xAxis") {
      await this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [event], true)
    }
    else if (target == "values") {
      await this.infoVisInteraction.addValues(this, this.visCanvas.currentVisualizationState, [event], true)
    }
    else if (target == "legend") {
      await this.infoVisInteraction.addLegends(this, this.visCanvas.currentVisualizationState, [event], true)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async unselect(event: any, target: string) {
    if (target == "xAxis") {
      await this.infoVisInteraction.removeXAxis(this, this.visCanvas.currentVisualizationState, [event], true)
    }
    else if (target == "values") {
      await this.infoVisInteraction.removeValues(this, this.visCanvas.currentVisualizationState, [event], true)
    }
    else if (target == "legend") {
      await this.infoVisInteraction.removeLegends(this, this.visCanvas.currentVisualizationState, [event], true)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }





  search(event: any) {
    console.log(event);
    this.filteredDataFields = this.visCanvas.dataFields.filter(c => c.toLowerCase().startsWith(event.query.toLowerCase()));
  }

  async checkTarget(event: any) {
    if (event.value.includes(event.option)) {
      if (this.visCanvas.dataFieldsConfig[event.option] == "quantitative") {
        this.infoVisInteraction.addValues(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
      else if (this.visCanvas.currentVisualizationState['x-Axis'].length == 0) {
        this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
      else if (this.visCanvas.currentVisualizationState['Color'].length == 0) {
        this.infoVisInteraction.addLegends(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
      else {
        this.infoVisInteraction.addXAxis(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
    }
    else {
      if (this.visCanvas.currentVisualizationState['x-Axis'].includes(event.option)) {
        await this.infoVisInteraction.removeXAxis(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
      else if (this.visCanvas.currentVisualizationState['Values'].includes(event.option)) {
        await this.infoVisInteraction.removeValues(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
      else if (this.visCanvas.currentVisualizationState['Color'].includes(event.option)) {
        await this.infoVisInteraction.removeLegends(this, this.visCanvas.currentVisualizationState, [event.option], true)
      }
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async deleteFilter(event: any, target: any) {
    await this.infoVisInteraction.removeFilters(this, this.visCanvas.currentVisualizationState, [target], true)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }


  async changeVisualizationMouse(target: string) {
    await this.infoVisInteraction.changeVisualization(this, this.visCanvas.currentVisualizationState, target, true)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  async changeAggregateMouse(event, target) {
    console.log(event)
    await this.infoVisInteraction.changeAggregate(this, this.visCanvas.currentVisualizationState, target, event.value, true)
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

      if(boundary == "LT" && event.value < this.visCanvas.currentVisualizationState["FilterN"][target][0]){
        verb = "ADD"
        if (this.visCanvas.currentVisualizationState["FilterN"][target][1] == this.visCanvas.maxList[target][this.visCanvas.currentVisualizationState["Aggregate"][target]]){
          filter = { "Filter": target, "GT": event.value }
        }
        else{
          filter = { "Filter": target, "GT": event.value, "LT":  this.visCanvas.currentVisualizationState["FilterN"][target][1]}
        }
      } 
      else if(boundary == "GT" && event.value > this.visCanvas.currentVisualizationState["FilterN"][target][1]){
        verb = "ADD"
        if (this.visCanvas.currentVisualizationState["FilterN"][target][0] == 0){
          filter = { "Filter": target, "LT": event.value }
        }
        else{
          filter = { "Filter": target, "LT": event.value, "GT":  this.visCanvas.currentVisualizationState["FilterN"][target][0]}
        }
      }
      
      this.infoVisInteraction.changeNumFilter(this, this.visCanvas.currentVisualizationState, [filter], verb, true)
      this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    }

  }

  changeCatFilterMouse(event, target) {
    console.log(event)
    var filter = {
      "KEY": target, "ID": [event.itemValue]
    }
    if (typeof (event.itemValue) == "undefined" && event.value.length == 0) {
      this.infoVisInteraction.removeCatFilter(this, this.visCanvas.currentVisualizationState, [{ "KEY": target, "ID": ["ALL"] }], true)
    }
    else if (typeof (event.itemValue) == "undefined" && event.value.length > 1 && this.visCanvas.optionDictionary[target].every(item => event.value.includes(item["value"]))) {
      this.infoVisInteraction.addCatFilter(this, this.visCanvas.currentVisualizationState, [{ "KEY": target, "ID": ["ALL"] }], true)
    }
    else if (event.value.includes(event.itemValue)) {
      this.visCanvas.currentVisualizationState["FilterC"][target] = this.visCanvas.currentVisualizationState["FilterC"][target].filter(element => element != event.itemValue)
      this.infoVisInteraction.addCatFilter(this, this.visCanvas.currentVisualizationState, [filter], true)
    }
    else {
      this.visCanvas.currentVisualizationState["FilterC"][target].push(event.itemValue)
      this.infoVisInteraction.removeCatFilter(this, this.visCanvas.currentVisualizationState, [filter], true)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  changeActiveFilterMouse(event, target, boundary) {
    console.log(event)
    this.infoVisInteraction.changeActiveFilter(this, this.visCanvas.currentVisualizationState, target, boundary, event.checked, true)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }


  handleChange(event: any, target: any) {
    if(this.visCanvas.currentVisualizationState['CheckedHighlight'][this.visCanvas.currentVisualizationState["Values"][target]]  && this.visCanvas.currentVisualizationState["Values"].length > 1){
      this.infoVisInteraction.removeAxisHighlight(this, this.visCanvas.currentVisualizationState, this.visCanvas.currentVisualizationState["Values"][target], true)
    }
    else if (this.visCanvas.currentVisualizationState["Values"].length > 1){
      this.infoVisInteraction.addAxisHighlight(this, this.visCanvas.currentVisualizationState, this.visCanvas.currentVisualizationState["Values"][target], true)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  handleChangeStar(event: any, target: any) {
    if(this.visCanvas.currentVisualizationState['CheckedHighlight'][target]){
      this.infoVisInteraction.removeAxisHighlight(this, this.visCanvas.currentVisualizationState, target, true)
    }
    else{
      this.infoVisInteraction.addAxisHighlight(this, this.visCanvas.currentVisualizationState, target, true)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  





  /** Labeling Mode 

  clickHighlight(e){
    e.preventDefault();
    return false;
  }

  mousoverHighlight(e){
    this.applyMask(e.target);
  }

  mouseoutHighlight(e){
    //this.clearMask()
  }

  applyMask(target) {
    if(document.getElementsByClassName('highlight-wrap').length > 0) {
        this.resizeMask(target);
    }else{
        this.createMask(target);
    }
}

resizeMask(target) {
    var rect = target.getBoundingClientRect();
    var hObj = document.getElementsByClassName('highlight-wrap')[0];
    hObj["style"].top=rect.top+"px";
    hObj["style"].width=rect.width+"px";
    hObj["style"].height=rect.height+"px";
    hObj["style"].left=rect.left+"px";
   // hObj.style.WebkitTransition='top 0.2s';
}

createMask(target) {
    var rect = target.getBoundingClientRect();
    var hObj = document.createElement("div");
    hObj.className = 'highlight-wrap';
    hObj["style"].position='absolute';
    hObj["style"].top=rect.top+"px";
    hObj["style"].width=rect.width+"px";
    hObj["style"].height=rect.height+"px";
    hObj["style"].left=rect.left+"px";
    hObj["style"].backgroundColor = '#205081';
    hObj["style"].opacity='0.5';
    hObj["style"].cursor='default';
    hObj["style"].pointerEvents='none';
    //hObj.style.WebkitTransition='top 0.2s';
    document.body.appendChild(hObj);
}

clearMasks() {
    var hwrappersLength = document.getElementsByClassName("highlight-wrap").length;
    var hwrappers = document.getElementsByClassName("highlight-wrap");
    if(hwrappersLength > 0) {
        for(var i=0; i<hwrappersLength; i++) {
            console.log("Removing existing wrap");
            hwrappers[i].remove();
        }
    }
}
*/



}
