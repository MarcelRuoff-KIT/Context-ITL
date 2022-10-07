import { AfterContentInit, AfterViewInit, AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { faEraser } from '@fortawesome/free-solid-svg-icons';


import { InfoVisInteractionService } from "../info-vis-interaction.service";
import { TrainingService } from "../training.service";
import { NLGeneration } from "../NLGeneration.service";
import { ContextCheckerService } from "../contextChecker.service"
import { StateHandlingService } from '../stateHandling.service';

import { VisualizationCanvasComponent } from '../visualization-canvas/visualization-canvas.component';

declare global {
  interface Window {
    WebChat: any;
  }
}

declare var LeaderLine: any;

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
  providers: [MessageService, ConfirmationService]
})
export class MainViewComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked {

  @ViewChild('visCanvas', { static: true }) visCanvas: VisualizationCanvasComponent;
  @ViewChild("botWindow", { static: true }) botWindowElement: ElementRef;


  constructor(
    public infoVisInteraction: InfoVisInteractionService,
    public training: TrainingService,
    public nlg: NLGeneration,
    public messageService: MessageService,
    public contextCh: ContextCheckerService,
    public confirmationService: ConfirmationService,
    public stateHandling: StateHandlingService
  ) { }

  public refreshInterval;
  public hoverInterval;

  //Overall System
  public firstBreakdown = true
  public overallMode = 2;
  public line: any = null;
  public mouseOver = ""
  public icon = faEraser


  draggedDatafield: any = null;
  currentTarget: any = ""


  filteredDataFields: string[] = []
  selectedDataFields: string[] = []


  //Conversational Agent
  public awaitingMessage = false;
  public directLine: any;
  public store: any;
  public componentMessage = null;
  public messengerID = null;
  public animate = false;
  public conversationHistory = false
  public speechInteraction = false
  public lastSpeechInteraction = {}

  //IterativeDialog
  public displayDialog = false;
  public positionDialog = "right"
  public chatbotMessage = ""
  public dialogWaitforNext = false;
  public highlightChildren = 0;
  public dialogBacklog = []



  //Training Mode
  askForTraining = false
  askForTrainingText = ""
  deniedReasoning = false
  public editMode = false;



  //Context Mode
  currentReasoningTargetHover = ""
  displaySuggestionDialog = false;
  displayAmbiguityDialogStart = false;
  displayAmbiguityDialogEnd = false;
  displaySuggestion = false
  displaySuggestionHelp = false
  blockedAction = false
  pinnedSuggestion = false
  visualizationSelected = false
  highlightedVisualization = {icon: 'pi pi-angle-left', state: 'old'}

  highlightOption = [
    {icon: 'pi pi-angle-left', state: 'old'},
    {icon: 'pi pi-angle-right', state: 'new'}
  ]


  hoverBlocker = ['generalDialog', 'suggestionDialog', 'nlClarification', 'displayConstraints', 'displayAmbiguities', 'acceptSuggestion', 'declineSuggestion', 'header', 'footer', 'pin', 'ConditionGuide', 'p-accordiontab']
  excludeList = ['interactionBlocker', 'targetHover', 'suggestion', 'vis', 'visCanvas', 'visGrid', 'suggestionHook', 'pin', 'pr_id']

  /**
   * Initialization of the System through Angular Lifecycle
   */


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
          action.payload.activity.channelData = { 'visState': this.visCanvas.currentVisualizationState, 'currentMode': this.overallMode };
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
          bubbleMaxWidth: 4500,
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


    for (var element in this.visCanvas.optionDictionary) {
      this.visCanvas.optionDictionary[element].forEach(item => this.visCanvas.currentVisualizationState['FilterC'][element].push(item["value"]))
    }

    this.stateHandling.resetStateHistory(this)


  }

  public ngAfterViewInit(): void {
    window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    document.addEventListener('mousemove', this.hoverTargetElement.bind(this))
    document.addEventListener('drag', this.highlightEncoding.bind(this))
  }

  public ngAfterViewChecked(): void {
    for (var i = 0; i < this.visCanvas.dataFields.length; i++) {
      var element = document.getElementById("Datafields_" + this.visCanvas.dataFields[i])
      try {
        if (element["tagName"] == "DIV") {
          element.parentElement.id = element.id
          element.id = ""
        }
      }
      catch {
        console.log(element)
      }
      /*try {
        var typeElement = document.getElementById("Datafields_" + this.visCanvas.dataFields[i] + "_Type")
        typeElement.style["height"] = typeElement.clientWidth + "px"
      }
      catch {
        console.log(typeElement)
      }*/
    }

  }



  public ngAfterContentInit() {

    LeaderLine.positionByWindowResize = false

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

  /**
   * Handling of Conversational Input
   * @param event 
   */

  public async webChatHandler(event) {



    if (event["data"]["from"]["role"] == 'bot' && event["data"]["type"] == "message") {
      this.positionDialog = "center"
      this.displayDialog = true;



      if (event["data"]["name"] == "Start Demonstration") {
        document.getElementById("botMessage").innerHTML = ""

        document.getElementById('nlInputInter')['style']['zIndex'] = '1101'

        if (this.firstBreakdown) {

          this.dialogBacklog = event["data"]["text"].split('$')
          this.chatbotMessage = this.dialogBacklog.shift()
          this.dialogWaitforNext = true
        }
        else {
          this.chatbotMessage = event["data"]["text"].replace('$', '')
        }

      }
      else if (event["data"]["name"] == "Ask Demonstration") {
        var text = event["data"]["text"].split('$')
        this.chatbotMessage = text.shift()
        this.askForTrainingText = text.shift()

      }
      else {
        if (this.overallMode != 2) {
          document.getElementById("botMessage").innerHTML = ""
        }
        this.chatbotMessage = event["data"]["text"]
      }



    }
    if (event["data"]["from"]["role"] == 'bot' && event["data"]["type"] == "event") {
      if (event["data"]["name"] == "Start Demonstration") {
        await this.startDemonstration(event["data"]["value"]["Content"], event["data"]["value"]["Entities"], event["data"]["value"]["nlInput"])
      }
      else if (event["data"]["name"] == "PerformNLI") {
        var configurationBefore = JSON.stringify(this.visCanvas.currentVisualizationState)
        this.training.lastVisualizationState = JSON.parse(JSON.stringify(this.visCanvas.currentVisualizationState))
        this.lastSpeechInteraction = {}
        this.speechInteraction = true
        if (event["data"]["value"].length > 0) {
          await this.infoVisInteraction.processAction(this, this.visCanvas.currentVisualizationState, event["data"]["value"][0]["Action"], true, null)
        }
        this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
        this.stateHandling.addAction(this, "Speech")
        this.speechInteraction = false
        console.log(this.lastSpeechInteraction)

        if (configurationBefore == JSON.stringify(this.visCanvas.currentVisualizationState)) {
          this.askForTraining = true

          this.directLine
            .postActivity({
              from: { id: "USER_ID", name: "USER_NAME" },
              name: "askForTraining",
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

      }
      else if (event["data"]["name"] == "finishedProcess") {
        this.awaitingMessage = false;
      }
    }
    else if (event["data"]["from"]["role"] == 'user' && event["data"]["type"] == "message") {
      $(".webchat__send-box-text-box__input").attr("placeholder", "Your previous Natural Language Input: " + event["data"]["text"])
      this.awaitingMessage = true;
    }
  }


  adaptPanel(event, dataField) {

    if (this.overallMode == 1) {
      document.getElementsByClassName('p-multiselect-header')[0].children[0].id = "Filter_" + dataField + "_All"

      for (var i = 0; i < this.visCanvas.optionDictionary[dataField].length; i++) {
        var element = document.getElementById("Filter_" + dataField + "_Elements_" + this.visCanvas.optionDictionary[dataField][i]['label'])
        try {
          if (element["tagName"] == "DIV") {
            element.parentElement.parentElement.id = element.id
            element.id = ""
          }
        }
        catch {
          console.log(element)
        }
      }
    }

  }




  putTargetElement(id) {
    var element = document.getElementById(id)
    while (element == null && id != '') {
      var splitID = id.split('_')
      splitID.pop()
      id = splitID.join('_')
      element = document.getElementById(id)
    }
    var target = document.getElementById(id)
    if (id != this.currentReasoningTargetHover && element != null) {
      let offsetTop = -3;
      let offsetLeft = -3;
      let scrollTop = 0;

      try {
        var parent = element['parentElement']
        while (parent) {
          scrollTop += parent['scrollTop']
          parent = parent['parentElement']
        }
      }
      catch {
        console.log(element)
      }

      while (element) {
        offsetTop += element['offsetTop'];
        offsetLeft += element['offsetLeft'];
        element = <HTMLElement>element['offsetParent'];
      }


      this.pinnedSuggestion = true
      this.showConnection()

      var suggestion = document.getElementById('suggestion')
      suggestion['style']["display"] = 'flex'
      if (target['clientWidth'] != 0) {
        suggestion['style']["width"] = '' + (target['clientWidth'] + 21) + 'px'
      }
      else {
        suggestion['style']["width"] = '' + (target['offsetWidth'] + 21) + 'px'
      }
      suggestion['style']["height"] = '' + (target['offsetHeight'] + 6) + 'px'
      suggestion['style']["top"] = '' + (offsetTop - scrollTop) + 'px'
      suggestion['style']["left"] = '' + offsetLeft + 'px'
    }
  }

  async getTargetElement(event) {
    if (this.overallMode == 1 && !this.blockedAction && !this.displayDialog) {
      var allElements = <HTMLElement[]>document.elementsFromPoint(event.x, event.y)
      try {
        var triggers = allElements.filter(element => { return element["className"] != null && typeof (element["className"]) != "undefined" && element["nodeName"] != "svg" && (element["className"].includes("p-multiselect-trigger") || element["className"].includes('p-accordion-toggle-icon')) })
      }
      catch {
        console.log(allElements)
        var triggers = <HTMLElement[]>[]
      }
      /*if (allElements.some(element => element["className"] != null && typeof (element["className"]) != "undefined" && element["nodeName"] != "svg" && element["className"].includes("ng-trigger-overlayAnimation"))) {

      }
      else */if (triggers.length > 0) {
        triggers[0].click()
      }
      else {
        if (!allElements.some(inc => { for (var i = 0; i < this.hoverBlocker.length; i++) { if (inc.id.startsWith(this.hoverBlocker[i])) { return true } } return false }) && !allElements.some(inc => typeof (inc.classList) != 'undefined' && (inc.classList.contains("p-dialog") || inc.classList.contains("p-dialog-content") || inc.classList.contains("p-component-overlay")))) {
          var target = allElements.filter(element => { return element.id != '' && !this.excludeList.some(comp => element.id.startsWith(comp)) })

          if (target.length > 0) {
            this.displaySuggestion = false
            this.displayAmbiguityDialogStart = false

            await this.putTargetElement(target[0]['id'])
            this.contextCh.getPossibleInterpretations(this, target[0]['id'])


          }

        }
      }

    }

    this.blockedAction = false

  }

  hoverTargetElement(event) {
    if (this.overallMode == 1 && !this.blockedAction && !this.displayDialog) {
      var allElements = <HTMLElement[]>document.elementsFromPoint(event.x, event.y)

      try {
        var triggers = allElements.filter(element => { return element["className"] != null && typeof (element["className"]) != "undefined" && element["nodeName"] != "svg" && (element["className"].includes("p-multiselect-trigger") || element["className"].includes('p-accordion-toggle-icon')) })
      }
      catch {
        var triggers = <HTMLElement[]>[]
      }
      var noOverlay = true
      try {
        var condition = allElements.some(element => element["className"] && typeof (element["className"]) == "string" != null && element["nodeName"] != "svg" && element["className"].includes("ng-trigger-overlayAnimation"))
      }
      catch {
        var condition = false
      }
      if (condition) {
        noOverlay = false
        for (var i = 0; i < allElements.length; i++) {
          if (allElements[i]["className"].includes("ng-trigger-overlayAnimation")) {
            break
          }
          else if (allElements[i].id != '' && allElements[i].id != 'interactionBlocker' && allElements[i].id != 'targetHover' && allElements[i].id != 'suggestion' && allElements[i].id != 'visCanvas' && allElements[i].id != 'visGrid' && allElements[i].id != 'suggestionHook') {
            noOverlay = true
            break
          }
        }
      }
      if (triggers.length > 0) {
        if (false && document.getElementsByClassName('p-multiselect-header').length == 0) {
          triggers[0].click()
        }
        document.body.style.cursor = "pointer";

      }
      else if (noOverlay) {
        document.body.style.cursor = "default";
        if (!allElements.some(inc => this.hoverBlocker.includes(inc.id)) && !allElements.some(inc => typeof (inc.classList) != 'undefined' && (inc.classList.contains("p-dialog") || inc.classList.contains("p-dialog-content") || inc.classList.contains("p-component-overlay")))) {
          var target = allElements.filter(element => { return element.id != '' && !this.excludeList.some(comp => element.id.startsWith(comp)) })

          if (target.length > 0) {
            if (target[0]['id'].startsWith("Filter_Energy Type_Elements_")) {
              console.log("done")
            }
            var element = <HTMLElement>target[0]
            if (target[0]['id'] != this.currentReasoningTargetHover && element != null) {

              if (!this.pinnedSuggestion && !this.displayAmbiguityDialogStart) {
                this.contextCh.getPossibleInterpretations(this, target[0]['id'])
                var suggestion = document.getElementById('suggestion')
                suggestion['style']["display"] = 'none'

                if (this.line == null) {
                  this.showConnection()
                }
                else {
                  this.line.position()
                }
              }

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

              var targetHover = document.getElementById('targetHover')
              targetHover['style']["display"] = 'flex'
              if (target[0]['clientWidth'] != 0) {
                targetHover['style']["width"] = '' + (target[0]['clientWidth'] + 6) + 'px'
              }
              else {
                targetHover['style']["width"] = '' + (target[0]['offsetWidth'] + 6) + 'px'
              }
              targetHover['style']["height"] = '' + (target[0]['offsetHeight'] + 6) + 'px'
              targetHover['style']["top"] = '' + (offsetTop - scrollTop) + 'px'
              targetHover['style']["left"] = '' + offsetLeft + 'px'
            }
          }
          else {
            var targetHover = document.getElementById('targetHover')
            targetHover['style']["display"] = 'none'
            if (!this.pinnedSuggestion) {
              this.removeConnection()
              this.displaySuggestionDialog = false
              this.contextCh.currentTarget = ""
            }
          }
        }
        else {
          var targetHover = document.getElementById('targetHover')
          targetHover['style']["display"] = 'none'
          if (!this.pinnedSuggestion) {
            this.removeConnection()
            this.displaySuggestionDialog = false
            this.contextCh.currentTarget = ""
          }
        }
      }
      else {
        var targetHover = document.getElementById('targetHover')
        targetHover['style']["display"] = 'none'
        if (!this.pinnedSuggestion) {
          this.removeConnection()
          this.displaySuggestionDialog = false
          this.contextCh.currentTarget = ""
        }
      }
    }
    else if(this.overallMode == 2){
      this.mouseOver = ''
    }
  }


  showSuggestions(mode) {
    this.displaySuggestionHelp = false
    if (this.contextCh.suggestions.length > 0) {
      this.displayDialog = false
      this.displaySuggestion = true
      this.displaySuggestionDialog = true

      if (mode == "next") {
        this.blockedAction = true
        this.contextCh.suggestionsPrevious = true
        this.contextCh.suggestionsIndex += 1
        if (this.contextCh.suggestionsIndex >= this.contextCh.suggestions.length - 1) {
          this.contextCh.suggestionsNext = false
        }
      }
      else if (mode == "previous") {
        this.blockedAction = true
        this.contextCh.suggestionsNext = true
        this.contextCh.suggestionsIndex -= 1
        if (this.contextCh.suggestionsIndex <= 0) {
          this.contextCh.suggestionsPrevious = false
        }
      }
      try {
        this.contextCh.getPossibleInterpretations(this, this.contextCh.suggestions[this.contextCh.suggestionsIndex])
        this.putTargetElement(this.contextCh.suggestions[this.contextCh.suggestionsIndex])
        this.displaySuggestion = true
      }
      catch {
        console.log(this.contextCh.suggestionsIndex)
      }

    }
  }


  declineSuggestion(event, target) {
    this.pinnedSuggestion = false
    this.removeConnection()

    if (target == "dialog") {
      this.displaySuggestion = false
    }
    else {
      this.blockedAction = true
    }
    document.getElementById('suggestion')["style"]["display"] = "none"
    this.displaySuggestionDialog = false
    this.contextCh.currentTarget = ""
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

        if (axis[i]["ariaLabel"] != null) {
          var bounds = axis[i].getBoundingClientRect()

          var element = document.getElementById("Canvas_Axis-" + counter)

          if (axis[i]["ariaLabel"].startsWith("X-axis")) {
            element = document.getElementById("Canvas_x-Axis")
          }
          else {
            counter++
          }

          element["style"]["display"] = "block"
          element["style"]["top"] = bounds.top.toString() + "px"
          element["style"]["left"] = bounds.left.toString() + "px"
          element["style"]["width"] = bounds.width.toString() + "px"
          element["style"]["height"] = bounds.height.toString() + "px"

        }
      }

      if (this.overallMode == 1 && this.contextCh.suggestions.length > 1) {
        if (this.contextCh.suggestionsIndex > 0) {
          this.contextCh.suggestionsPrevious = true
        }
        if (this.contextCh.suggestionsIndex < this.contextCh.suggestions.length - 1) {
          this.contextCh.suggestionsNext = true
        }
      }

    }, 1000)




  }

  receiveData(data: any) {
    console.log(data)
  }

  async startDemonstration(possibleActions, entities, nlInput) {
    this.deniedReasoning = false
    this.training.initialEntities = entities
    this.training.nlInput = nlInput
    this.overallMode = 0

    this.visCanvas.mode = this.overallMode

    this.contextCh.constraints = []
    this.contextCh.constraintText = []

    await this.training.initializeTraining(this, possibleActions)
    await this.adaptVisualizationSize(0)

    this.stateHandling.resetStateHistory(this)

  }

  async continueDemonstration() {
    this.chatbotMessage = ""
    this.visualizationSelected = false
    this.directLine
      .postActivity({
        from: { id: "USER_ID", name: "USER_NAME" },
        name: "startReasoning",
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



    if (this.hoverInterval) {
      clearInterval(this.hoverInterval);
    }
    this.hoverInterval = setInterval(() => {
      if (this.overallMode == 1 && this.displaySuggestionDialog && typeof (this.line != "undefined") && this.line != null) {
        this.line.position()
      }
      if (!this.pinnedSuggestion && document.getElementById('targetHover') != null && document.getElementById('targetHover')['style']["display"] == 'none' && this.line != null) {
        this.removeConnection()
      }
    }, 100)


    this.overallMode = 1
    this.visCanvas.mode = this.overallMode
    this.firstBreakdown = false
    this.displayDialog = true


    this.contextCh.constraints = this.training.possibleActions[this.training.selectedAmbiguity]["Constraints"]
    this.contextCh.constraintText = this.training.possibleActions[this.training.selectedAmbiguity]["ConstraintsText"]

    this.contextCh.finalActions = this.training.possibleActions[this.training.selectedAmbiguity]

    this.contextCh.getAmbiguousNumber(this)

    await this.contextCh.deriveSuggestions(this)

    this.visCanvas.currentVisualizationState = JSON.parse(JSON.stringify(this.training.initialVisualizationState))

    await this.adaptVisualizationSize(1)

    this.nlg.initializeUnderstandingDisplay(this, this.contextCh.finalActions["Action"], "reasoning")
  }

  async endDemonstration(event, finished) {
    if (this.hoverInterval) {
      clearInterval(this.hoverInterval);
    }
    this.displaySuggestionDialog = false
    this.contextCh.currentTarget = ""
    this.firstBreakdown = false

    if (finished) {
      if (this.deniedReasoning || this.overallMode == 1) {


        if (this.overallMode == 1) {
          this.visCanvas.currentVisualizationState = this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity]
          this.nlg.initializeUnderstandingDisplay(this, {}, "reasoning")
        }

        this.overallMode = 2
        this.visCanvas.mode = this.overallMode
        this.adaptVisualizationSize(2)
        this.messageService.add({ severity: 'success', summary: 'New Natural Language Input', detail: 'You have successfully trained a new Natural Language Input.' });

        console.log({
          'sequence': this.training.possibleActions[this.training.selectedAmbiguity]["Action"],
          'initialState': this.training.initialVisualizationState,
          'constraints': { "triples": this.contextCh.constraints, "text": this.contextCh.constraintText }
        })

        this.directLine
          .postActivity({
            from: { id: "USER_ID", name: "USER_NAME" },
            name: "endTrainingMode",
            type: "event",
            value: {
              'sequence': this.training.possibleActions[this.training.selectedAmbiguity]["Action"],
              'initialState': this.training.initialVisualizationState,
              'constraints': { "triples": this.contextCh.constraints, "text": this.contextCh.constraintText },
              'ambiguityConstraint': this.contextCh.ambiguitiesEnd
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

        this.visCanvas.possibleVisualizationStates = []
        this.training.possibleActions = [{ "Action": {}, "ID": 0, "Score": 0 }, { "Action": {}, "ID": 1, "Score": 1 }, { "Action": {}, "ID": 2, "Score": 2 }, { "Action": {}, "ID": 3, "Score": 3 }, { "Action": {}, "ID": 4, "Score": 4 }, { "Action": {}, "ID": 5, "Score": 5 }]
        this.nlg.initializeUnderstandingDisplay(this, {}, "training")
        this.contextCh.suggestions = []
        this.stateHandling.resetStateHistory(this)
        this.contextCh.ambiguitiesStart = []
        this.contextCh.ambiguitiesEnd = []
      }
      else {
        var nlInput = ""
        for (var i = 0; i < this.training.nlInput.length; i++) {
          nlInput += this.training.nlInput[i]["Text"] + " "
        }

        var number = 0

        this.contextCh.http.post<any>(this.contextCh.restAPI + '/ambiguitiesNumber', { command: nlInput, Constraints: this.contextCh.constraints, currentConfiguration: this.training.initialVisualizationState, finalActions: this.training.possibleActions[this.training.selectedAmbiguity], ambiguitiesEnd: [] }).subscribe({
          next: data => {

            var number = data['Ambiguities']
            if (number > 0) {
              this.confirmationService.confirm({
                target: event.target,
                message: 'Unfortunately, I detected ' + number + ' conflicting interpretation(s) for your Natural Language Input. Can you help me better understand how the data fields selected and configuration of the data visualization influenced your interpretation of the Natural Language Input?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                  this.continueDemonstration()
                },
                reject: () => {
                  this.endDemonstration(event, true)
                }
              });


            }
            else {
              this.confirmationService.confirm({
                target: event.target,
                message: 'Can you help me better understand how the data fields selected and configuration of the data visualization influenced your interpretation of the Natural Language Input?',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                  this.continueDemonstration()
                },
                reject: () => {
                  this.endDemonstration(event, true)
                }
              });
            }
          },
          error: error => {
            console.log("noting")
          }
        })
        this.deniedReasoning = true

      }
    }
    else {

      if (this.overallMode == 1) {
        this.visCanvas.currentVisualizationState = this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity]
      }

      this.adaptVisualizationSize(2)
      this.visCanvas.mode = this.overallMode
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

      this.visCanvas.possibleVisualizationStates = []
      this.training.possibleActions = [{ "Action": {}, "ID": 0, "Score": 0 }, { "Action": {}, "ID": 1, "Score": 1 }, { "Action": {}, "ID": 2, "Score": 2 }, { "Action": {}, "ID": 3, "Score": 3 }, { "Action": {}, "ID": 4, "Score": 4 }, { "Action": {}, "ID": 5, "Score": 5 }]
      this.nlg.initializeUnderstandingDisplay(this, {}, "training")
      this.stateHandling.resetStateHistory(this)
      this.contextCh.ambiguitiesStart = []
      this.contextCh.ambiguitiesEnd = []
      this.contextCh.suggestions = []
    }

    /*window.removeEventListener('click', this.clickHighlight, false)
    window.removeEventListener('mouseover', this.mousoverHighlight, false)
    window.removeEventListener('mouseout', this.mouseoutHighlight, false)*/


  }

  async adaptVisualizationSize(target) {
    this.overallMode = target
    this.visCanvas.mode = this.overallMode


    if (target == 0) {
      document.getElementById("displayAmbiguities")["style"]["display"] = "block"
      document.getElementById("visGrid")["style"]["height"] = "50%"
      document.getElementById("nlClarification")["style"]["height"] = "10%"
      document.getElementById("visCanvas")["className"] = "col-6 col-offset-1"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "block"


    }
    else if (target == 1) {
      document.getElementById("displayConstraints")["style"]["display"] = "block"
      document.getElementById("displayAmbiguities")["style"]["display"] = "none"
      document.getElementById("visGrid")["style"]["height"] = "40%"
      document.getElementById("nlClarification")["style"]["height"] = "10%"
      document.getElementById("visCanvas")["className"] = "col-12"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "none"
    }
    else {
      document.getElementById("displayAmbiguities")["style"]["display"] = "none"
      document.getElementById("displayConstraints")["style"]["display"] = "none"
      document.getElementById("visGrid")["style"]["height"] = "80%"
      document.getElementById("nlClarification")["style"]["height"] = "15%"
      document.getElementById("visCanvas")["className"] = "col-12"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "none"
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

    this.nlg.initializeUnderstandingDisplay(this, this.training.possibleActions[ambiguity]["Action"], "training")

    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");

    this.stateHandling.addAction(this, "Mouse")
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
    await this.training.removeAction(this, event.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id.split("_"))

    this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity] = await this.training.changeAmbiguityInterpretation(this, this.training.possibleActions[this.training.selectedAmbiguity])

    this.visCanvas.currentVisualizationState = this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity]

    await this.nlg.initializeUnderstandingDisplay(this, this.training.possibleActions[this.training.selectedAmbiguity]["Action"], "training")

    await this.visCanvas.createVisualization(this, this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity], "#Ambiguity_" + this.training.selectedAmbiguity, "small")

    await this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
  }

  showHistory(event) {
    this.overallMode += 1
    if (this.overallMode > 2) {
      this.overallMode = 0
    }
    this.adaptVisualizationSize(this.overallMode)


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



  /**
   * 
   * INFOVIS Interaction via Mouse
   */

   mouseTarget(target){
    if (this.mouseOver == target && this.draggedDatafield != null){
      
      return true
    }
    else{
      return false
    }
    
   }

   highlightEncoding(event) {
    if(this.overallMode == 2 || this.overallMode == 0 ){
      var allElements = <HTMLElement[]>document.elementsFromPoint(event.x, event.y)
      var target = allElements.filter(element => { return element.id == 'x-Axis' || element.id == 'Values' || element.id == 'Color' || element.id == 'Filter_Adding'})
      if(target.length > 0){
        this.mouseOver = target[0].id
      }
      else{
        this.mouseOver = ''
      }
    }
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
    this.stateHandling.addAction(this, "Mouse")
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
    this.stateHandling.addAction(this, "Mouse")
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
    else if (target == "filter") {
      await this.infoVisInteraction.removeFilters(this, this.visCanvas.currentVisualizationState, [event], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")
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
    this.stateHandling.addAction(this, "Mouse")
  }

  async deleteFilter(event: any, target: any) {
    await this.infoVisInteraction.removeFilters(this, this.visCanvas.currentVisualizationState, [target], true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")
  }


  async changeVisualizationMouse(target: string) {

    await this.infoVisInteraction.changeVisualization(this, this.visCanvas.currentVisualizationState, target, true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")
  }

  async changeAggregateMouse(event, target) {
    await this.infoVisInteraction.changeAggregate(this, this.visCanvas.currentVisualizationState, target, event.value, true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")
  }

  showErrorMessage() {
    document.getElementById("errorMessage")["style"]["display"] = "block"
  }

  async changeNumFilterMouse(event, target, boundary) {
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

      await this.infoVisInteraction.changeNumFilter(this, this.visCanvas.currentVisualizationState, [filter], verb, true, null)
      this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
      this.stateHandling.addAction(this, "Mouse")
    }

  }

  async changeCatFilterMouse(event, target) {
    var filter = {
      "KEY": target, "ID": [event.itemValue]
    }
    if (typeof (event.itemValue) == "undefined" && event.value.length == 0) {
      await this.infoVisInteraction.removeCatFilter(this, this.visCanvas.currentVisualizationState, [{ "KEY": target, "ID": ["ALL"] }], true, null)
    }
    else if (typeof (event.itemValue) == "undefined" && event.value.length > 1 && this.visCanvas.optionDictionary[target].every(item => event.value.includes(item["value"]))) {
      await this.infoVisInteraction.addCatFilter(this, this.visCanvas.currentVisualizationState, [{ "KEY": target, "ID": ["ALL"] }], true, null)
    }
    else if (event.value.includes(event.itemValue)) {
      this.visCanvas.currentVisualizationState["FilterC"][target] = this.visCanvas.currentVisualizationState["FilterC"][target].filter(element => element != event.itemValue)
      await this.infoVisInteraction.addCatFilter(this, this.visCanvas.currentVisualizationState, [filter], true, null)
    }
    else {
      this.visCanvas.currentVisualizationState["FilterC"][target].push(event.itemValue)
      await this.infoVisInteraction.removeCatFilter(this, this.visCanvas.currentVisualizationState, [filter], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")
  }

  async changeActiveFilterMouse(event, target, boundary) {
    await this.infoVisInteraction.changeActiveFilter(this, this.visCanvas.currentVisualizationState, target, boundary, event.checked, true, null)
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")

  }


  async handleChange(event: any, target: any) {
    if (this.visCanvas.currentVisualizationState['CheckedHighlight'][this.visCanvas.currentVisualizationState["Values"][target]] && this.visCanvas.currentVisualizationState["Values"].length > 1) {
      await this.infoVisInteraction.removeAxisHighlight(this, this.visCanvas.currentVisualizationState, this.visCanvas.currentVisualizationState["Values"][target], true, null)
    }
    else if (this.visCanvas.currentVisualizationState["Values"].length > 1) {
      await this.infoVisInteraction.addAxisHighlight(this, this.visCanvas.currentVisualizationState, this.visCanvas.currentVisualizationState["Values"][target], true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")

  }

  async handleChangeStar(event: any, target: any) {
    if (!this.visCanvas.currentVisualizationState['CheckedHighlight'][target]) {
      await this.infoVisInteraction.removeAxisHighlight(this, this.visCanvas.currentVisualizationState, target, true, null)
    }
    else {
      await this.infoVisInteraction.addAxisHighlight(this, this.visCanvas.currentVisualizationState, target, true, null)
    }
    this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    this.stateHandling.addAction(this, "Mouse")
  }

  handleHideDialog(event: any, target) {
    if (this.dialogWaitforNext && this.dialogBacklog.length > 0 && this.overallMode == 0 && target == "Show") {
      this.positionDialog = "bottom-right"
      this.displayDialog = true
      document.getElementById('nlInputInter')['style']['zIndex'] = '1'
      document.getElementById('ambiguityCarousel')['style']['zIndex'] = '1101'
      document.getElementById('ambiguityCarousel')['style']['pointer-events'] = 'none'

      this.chatbotMessage = this.dialogBacklog.shift()

      if (this.dialogBacklog.length == 0) {
        this.dialogWaitforNext = false
      }

      this.highlightChildren = 1
    }
    else if (this.overallMode == 0) {
      document.getElementById('nlInputInter')['style']['zIndex'] = '1'

      document.getElementById('ambiguityCarousel')['style']['pointer-events'] = ''
      document.getElementById('ambiguityCarousel')['style']['zIndex'] = '1'

      document.getElementById('Datafields')['style']['zIndex'] = '1'
      document.getElementById('Datafields')['style']['pointer-events'] = ''

      document.getElementById('Encodings')['style']['zIndex'] = '1'
      document.getElementById('Encodings')['style']['pointer-events'] = ''

      document.getElementById('Filter')['style']['zIndex'] = '1'
      document.getElementById('Filter')['style']['pointer-events'] = ''

      document.getElementById('visCanvas')['style']['zIndex'] = '1'
      document.getElementById('visCanvas')['style']['pointer-events'] = ''

      document.getElementById('botWin')['style']['zIndex'] = '1'
      document.getElementById('botWin')['style']['pointer-events'] = ''

      document.getElementById('actionSequenceMeta')['style']['zIndex'] = '1'
      document.getElementById('actionSequenceMeta')['style']['pointer-events'] = ''
    }
    else if (this.overallMode == 1 && this.contextCh.suggestions.length > 0 && target == "Show") {
      this.showSuggestions('current')
    }
    else {
      document.getElementById('nlInputInter')['style']['zIndex'] = '1'
    }
  }

  showHowTraining() {
    this.positionDialog = 'top-right'
    if (this.highlightChildren == 1) {
      var text = document.getElementById("chatbotDialog").children[0].children[0].innerHTML
      document.getElementById("chatbotDialog").children[0].children[0].innerHTML = text.replace('<strong>', '').replace('</strong>', '')
      document.getElementById("chatbotDialog").children[0]["style"]["font-weight"] = "normal !important"


      document.getElementById("chatbotDialog").children[1]["style"]["font-weight"] = "bold"
      document.getElementById('ambiguityCarousel')['style']['zIndex'] = '1'
      document.getElementById('ambiguityCarousel')['style']['pointer-events'] = ''

      document.getElementById('Datafields')['style']['zIndex'] = '1101'
      document.getElementById('Datafields')['style']['pointer-events'] = 'none'

      document.getElementById('Encodings')['style']['zIndex'] = '1101'
      document.getElementById('Encodings')['style']['pointer-events'] = 'none'

      document.getElementById('Filter')['style']['zIndex'] = '1101'
      document.getElementById('Filter')['style']['pointer-events'] = 'none'

      document.getElementById('visCanvas')['style']['zIndex'] = '1101'
      document.getElementById('visCanvas')['style']['pointer-events'] = 'none'

      document.getElementById('botWin')['style']['zIndex'] = '1101'
      document.getElementById('botWin')['style']['pointer-events'] = 'none'


    }
    else if (this.highlightChildren == 2) {
      document.getElementById("chatbotDialog").children[1]["style"]["font-weight"] = "normal"
      document.getElementById("chatbotDialog").children[2]["style"]["font-weight"] = "bold"

      document.getElementById('Datafields')['style']['zIndex'] = '1'
      document.getElementById('Datafields')['style']['pointer-events'] = ''

      document.getElementById('Encodings')['style']['zIndex'] = '1'
      document.getElementById('Encodings')['style']['pointer-events'] = ''

      document.getElementById('Filter')['style']['zIndex'] = '1'
      document.getElementById('Filter')['style']['pointer-events'] = ''

      document.getElementById('visCanvas')['style']['zIndex'] = '1'
      document.getElementById('visCanvas')['style']['pointer-events'] = ''

      document.getElementById('botWin')['style']['zIndex'] = '1'
      document.getElementById('botWin')['style']['pointer-events'] = ''

      document.getElementById('actionSequenceMeta')['style']['zIndex'] = '1101'
      document.getElementById('actionSequenceMeta')['style']['pointer-events'] = 'none'
    }
    this.highlightChildren += 1
  }

  addConstraint(targetText) {
    //this.displaySuggestionDialog = false;
    this.contextCh.addConstraint(this, targetText)
  }

  removeConstraint(event, target) {
    this.contextCh.removeConstraint(this, target)
  }

  async stateHandlingFunction(action) {
    if (action == "undo") {
      if (this.overallMode == 2 && this.stateHandling.stateHistory[this.stateHandling.activeElement]["Origin"] == "Speech" && this.stateHandling.stateHistory[this.stateHandling.activeElement]["ID"] == this.stateHandling.speechID) {
        this.askForTraining = true

        this.directLine
          .postActivity({
            from: { id: "USER_ID", name: "USER_NAME" },
            name: "askForTraining",
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
      await this.stateHandling.undo(this)

    }
    else if (action == "redo") {
      this.stateHandling.redo(this)
    }
  }

  askForTrainingAnswer(answer) {
    this.displayDialog = false
    this.askForTraining = false
    if (answer) {
      this.visCanvas.currentVisualizationState = JSON.parse(JSON.stringify(this.training.lastVisualizationState))
      this.directLine
        .postActivity({
          from: { id: "USER_ID", name: "USER_NAME" },
          name: "startDemonstration",
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
  }

  showConnection() {
    var startingElement = document.querySelector('#suggestionBot');

    if (this.displayAmbiguityDialogStart) {
      startingElement = document.querySelector('#suggestionBotStart');
    }

    var endingElement = document.querySelector('#suggestionHook');


    if (!this.pinnedSuggestion) {
      endingElement = document.querySelector('#targetHover');
    }


    if (typeof (this.line) != "undefined" && this.line != null) {
      this.line.remove()
      this.line = null
    }

    if (typeof (startingElement) != "undefined" && typeof (endingElement) != "undefined" && startingElement != null && endingElement != null) {
      this.line = new LeaderLine(startingElement, endingElement, { color: '#a6192e', endPlug: 'square' });
    }

  }
  removeConnection() {
    if (typeof (this.line) != "undefined" && this.line != null) {
      this.line.remove()
      this.line = null
    }
  }

  processTooltip(input) {
    var text = input.toLowerCase()
    if (this.visCanvas.datafieldTypes.includes(text)) {
      return this.visCanvas.dataFieldsConfigTranslate[text] + " data field"
    }
    return text
  }

  getAmbiguousActions() {
    this.contextCh.getAmbiguousActionsEnd(this, true)
  }

  changePrevVisualization() {
    if (this.highlightedVisualization['state'] == 'old') {
      this.visCanvas.createVisualization(this, this.visCanvas.currentVisualizationState, "#vis", "large");
    }
    else {
      this.visCanvas.createVisualization(this, this.visCanvas.possibleVisualizationStates[this.training.selectedAmbiguity], "#vis", "large");

    }

  }

  openDialogSuggestion(){
    this.contextCh.getAmbiguousActionsEnd(this, false)
    this.contextCh.getAmbiguousActionsStart(this, 'during', false)
    this.displaySuggestionHelp = true

  }

}
