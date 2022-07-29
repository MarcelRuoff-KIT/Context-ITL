import { AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InfoVisInteractionService } from "../info-vis-interaction.service";
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
    private infoVisInteraction: InfoVisInteractionService
  ) { }

  public refreshInterval;

  //Conversational Agent
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

  checked: boolean = false;

  actionAmbiguities = [1, 2]

  selectedAmbiguity = 1

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




    this.selectedDataFields = [];

    this.directLine = window.WebChat.createDirectLine({
      secret: "v4jqpsOBELM.pOwD_GENZs7-klKTlZBF8Y_f5MPfgR2n4YNmaDO9-AU",
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
        //webSpeechPonyfillFactory: await createHybridPonyfillFactory(),
        locale: 'en-US',
        store: this.store,
        overrideLocalizedStrings: {
          TEXT_INPUT_PLACEHOLDER: 'Please type the command you want to perform...'//'Click on the microphone and speak OR type ...'
        }

      },
      this.botWindowElement.nativeElement

    );
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

    this.adaptVisualizationSize()

    await this.infoVisInteraction.addValues(this, ["Amount"], true)
    await this.infoVisInteraction.addLegends(this, ["State"], true)
    await this.infoVisInteraction.addXAxis(this, ["Energy Type"], true)
    await this.infoVisInteraction.openingFilters(this, ["State"], true)
    await this.infoVisInteraction.removeCatFilter(this, [{ "State": "ALL" }], true)
    await this.infoVisInteraction.addCatFilter(this, [{ "State": ["Florida"] }], true)
    await this.infoVisInteraction.removeLegendHighlight(this.visCanvas, ["ALL"], true)

    this.visCanvas.createVisalization();
  }

  adaptVisualizationSize() {

    this.correctionMode = !this.correctionMode

    if (this.correctionMode) {
      document.getElementById("displayAmbiguities")["style"]["display"] = "block"
      document.getElementById("visGrid")["style"]["height"] = "50%"
      document.getElementById("visCanvas")["className"] = "col-6"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "block"

    }
    else {

      document.getElementById("displayAmbiguities")["style"]["display"] = "none"
      document.getElementById("visGrid")["style"]["height"] = "80%"
      document.getElementById("visCanvas")["className"] = "col-12"
      document.getElementById("actionSequenceMeta")["style"]["display"] = "none"

    }
    this.visCanvas.createVisalization();

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
    this.selectedAmbiguity = ambiguity

    if (ambiguity == 1) {
      await this.infoVisInteraction.openingFilters(this, ["State"], true)
      await this.infoVisInteraction.removeCatFilter(this, [{ "State": "ALL" }], true)
      await this.infoVisInteraction.addCatFilter(this, [{ "State": ["Florida"] }], true)
      await this.infoVisInteraction.removeLegendHighlight(this.visCanvas, ["ALL"], true)

    }
    else {
      await this.infoVisInteraction.addLegendHighlight(this.visCanvas, ["Florida"], true)
      await this.infoVisInteraction.removeFilters(this, ["State"], true)
    }

    this.visCanvas.createVisalization();
  }

  changeAmbiguityCompare(event, ambiguity) {
    this.compareMode = !this.compareMode
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
        await this.infoVisInteraction.addXAxis(this, [this.draggedDatafield], true)
      }
      else if (target == "values") {
        await this.infoVisInteraction.addValues(this, [this.draggedDatafield], true)
      }
      else if (target == "legend") {
        await this.infoVisInteraction.addLegends(this, [this.draggedDatafield], true)
      }
      else if (target == "filter") {
        await this.infoVisInteraction.openingFilters(this, [this.draggedDatafield], true)
      }

      this.draggedDatafield = null;
    }
    this.visCanvas.createVisalization();
  }

  async select(event: any, target: string) {
    if (target == "xAxis") {
      await this.infoVisInteraction.addXAxis(this, [event], true)
    }
    else if (target == "values") {
      await this.infoVisInteraction.addValues(this, [event], true)
    }
    else if (target == "legend") {
      await this.infoVisInteraction.addLegends(this, [event], true)
    }
    this.visCanvas.createVisalization();
  }

  async unselect(event: any, target: string) {
    if (target == "xAxis") {
      await this.infoVisInteraction.removeXAxis(this, [event], true)
    }
    else if (target == "values") {
      await this.infoVisInteraction.removeValues(this, [event], true)
    }
    else if (target == "legend") {
      await this.infoVisInteraction.removeLegends(this, [event], true)
    }
    this.visCanvas.createVisalization();
  }





  search(event: any) {
    console.log(event);
    this.filteredDataFields = this.visCanvas.dataFields.filter(c => c.toLowerCase().startsWith(event.query.toLowerCase()));
  }

  async checkTarget(event: any) {
    if (event.value.includes(event.option)) {
      if (this.visCanvas.dataFieldsConfig[event.option] == "quantitative") {
        this.infoVisInteraction.addValues(this, [event.option], true)
      }
      else if (this.visCanvas.xAxis.length == 0) {
        this.infoVisInteraction.addXAxis(this, [event.option], true)
      }
      else if (this.visCanvas.legend.length == 0) {
        this.infoVisInteraction.addLegends(this, [event.option], true)
      }
      else {
        this.infoVisInteraction.addXAxis(this, [event.option], true)
      }
    }
    else {
      if (this.visCanvas.xAxis.includes(event.option)) {
        await this.infoVisInteraction.removeXAxis(this, [event.option], true)
      }
      else if (this.visCanvas.values.includes(event.option)) {
        await this.infoVisInteraction.removeValues(this, [event.option], true)
      }
      else if (this.visCanvas.legend.includes(event.option)) {
        await this.infoVisInteraction.removeLegends(this, [event.option], true)
      }
    }
    this.visCanvas.createVisalization();
  }

  async deleteFilter(event: any, target: any) {
    await this.infoVisInteraction.removeFilters(this, [target], true)
    this.visCanvas.createVisalization();
  }


  async changeVisualizationMouse(target: string) {
    await this.infoVisInteraction.changeVisualization(this, target, true)
    this.visCanvas.createVisalization();
  }

  async changeAggregateMouse(event, target) {
    console.log(event)
    await this.infoVisInteraction.changeAggregate(this, target, event.value, true)
    this.visCanvas.createVisalization();
  }

  showErrorMessage() {
    document.getElementById("errorMessage")["style"]["display"] = "block"
    this.errorCounter = 4
  }

  changeNumFilterMouse(event, target, boundary) {
    var range = [0, 0]
    if (boundary == 0) {
      range = [event.value, this.visCanvas.filterNumber[target][1]]
    }
    else {
      range = [this.visCanvas.filterNumber[target][0], event.value]
    }

    var filter = { [target]: range }
    this.infoVisInteraction.changeNumFilter(this, [filter], true)
    this.visCanvas.createVisalization();

  }

  changeCatFilterMouse(event, target) {
    console.log(event)
    var filter = {
      [target]: [event.itemValue]
    }
    if (typeof (event.itemValue) !== undefined && event.value.length == 0) {
      this.infoVisInteraction.removeCatFilter(this, [{ [target]: "ALL" }], true)
    }
    else if (typeof (event.itemValue) !== undefined && event.value.length > 1 && this.visCanvas.optionDictionary[target].every(item => event.value.includes(item["value"]))) {
      this.infoVisInteraction.addCatFilter(this, [{ [target]: "ALL" }], true)
    }
    else if (event.value.includes(event.itemValue)) {
      this.visCanvas.filterDictionary[target] = this.visCanvas.filterDictionary[target].filter(element => element != event.itemValue)
      this.infoVisInteraction.addCatFilter(this, [filter], true)
    }
    else {
      this.visCanvas.filterDictionary[target].push(event.itemValue)
      this.infoVisInteraction.removeCatFilter(this, [filter], true)
    }
    this.visCanvas.createVisalization();
  }

  changeActiveFilterMouse(event, target, boundary) {
    console.log(event)
    this.infoVisInteraction.changeActiveFilter(this, target, boundary, event.checked, true)
    this.visCanvas.createVisalization();
  }






}
