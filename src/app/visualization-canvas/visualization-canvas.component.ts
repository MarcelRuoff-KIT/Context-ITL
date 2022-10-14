import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, Output, Input, EventEmitter } from '@angular/core';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';

import data from '../data/Data_Investment.json';

interface Item {
  label: string,
  value: string
}

declare let vegaEmbed: any;

@Component({
  selector: 'app-visualization-canvas',
  templateUrl: './visualization-canvas.component.html',
  styleUrls: ['./visualization-canvas.component.scss']
})
export class VisualizationCanvasComponent {

  @Output() receiveData = new EventEmitter<any>();

  public baseWidth = 860
  public targetWidth = 100

  public csvRecords: any[] = [];
  public header = false;

  public retry = {"#vis": 0}

  public mode = 2


  //Visualization 

  public dataFields = ['Number of Projects', 'Amount Invested', 'State', 'Energy Type', 'Party of Governor', 'Investment Type', 'Year']

  public datafieldTypes = ["nominal", "temporal", "quantitative"]

  public visualizationTypes = ["bar", "point", "line"]

  public dataFieldsConfig: { [characterName: string]: string } = {

    "Energy Type": "nominal",
    "State": "nominal",
    "Party of Governor": "nominal",
    "Investment Type": "nominal",
    "Year": "temporal",
    "Number of Projects": "quantitative",
    "Amount Invested": "quantitative",
    //"Population": "quantitative"
  }

  dataFieldsConfigTranslate: { [characterName: string]: string } = {
    "nominal": "category-based",
    "temporal": "time-based",
    "quantitative": "number-based"
  }

  public optionDictionary: { [characterName: string]: Item[] } = {
    "Party of Governor": [{'label': 'Democratic', 'value': 'Democratic'}, {'label': 'Independant', 'value': 'Independant'}, {'label': 'Republican', 'value': 'Republican'}],
    "State":[{'label': 'Alabama', 'value': 'Alabama'},
    {'label': 'Alaska', 'value': 'Alaska'},
    {'label': 'Arizona', 'value': 'Arizona'},
    {'label': 'Arkansas', 'value': 'Arkansas'},
    {'label': 'California', 'value': 'California'},
    {'label': 'Colorado', 'value': 'Colorado'},
    {'label': 'Connecticut', 'value': 'Connecticut'},
    {'label': 'Delaware', 'value': 'Delaware'},
    {'label': 'Florida', 'value': 'Florida'},
    {'label': 'Georgia', 'value': 'Georgia'},
    {'label': 'Hawaii', 'value': 'Hawaii'},
    {'label': 'Idaho', 'value': 'Idaho'},
    {'label': 'Illinois', 'value': 'Illinois'},
    {'label': 'Indiana', 'value': 'Indiana'},
    {'label': 'Iowa', 'value': 'Iowa'},
    {'label': 'Kansas', 'value': 'Kansas'},
    {'label': 'Kentucky', 'value': 'Kentucky'},
    {'label': 'Louisiana', 'value': 'Louisiana'},
    {'label': 'Maine', 'value': 'Maine'},
    {'label': 'Maryland', 'value': 'Maryland'},
    {'label': 'Massachusetts', 'value': 'Massachusetts'},
    {'label': 'Michigan', 'value': 'Michigan'},
    {'label': 'Minnesota', 'value': 'Minnesota'},
    {'label': 'Mississippi', 'value': 'Mississippi'},
    {'label': 'Missouri', 'value': 'Missouri'},
    {'label': 'Montana', 'value': 'Montana'},
    {'label': 'Nebraska', 'value': 'Nebraska'},
    {'label': 'Nevada', 'value': 'Nevada'},
    {'label': 'New Hampshire', 'value': 'New Hampshire'},
    {'label': 'New Jersey', 'value': 'New Jersey'},
    {'label': 'New Mexico', 'value': 'New Mexico'},
    {'label': 'New York', 'value': 'New York'},
    {'label': 'North Carolina', 'value': 'North Carolina'},
    {'label': 'North Dakota', 'value': 'North Dakota'},
    {'label': 'Ohio', 'value': 'Ohio'},
    {'label': 'Oklahoma', 'value': 'Oklahoma'},
    {'label': 'Oregon', 'value': 'Oregon'},
    {'label': 'Pennsylvania', 'value': 'Pennsylvania'},
    {'label': 'Puerto Rico', 'value': 'Puerto Rico'},
    {'label': 'Rhode Island', 'value': 'Rhode Island'},
    {'label': 'South Carolina', 'value': 'South Carolina'},
    {'label': 'South Dakota', 'value': 'South Dakota'},
    {'label': 'Tennessee', 'value': 'Tennessee'},
    {'label': 'Texas', 'value': 'Texas'},
    {'label': 'Utah', 'value': 'Utah'},
    {'label': 'Vermont', 'value': 'Vermont'},
    {'label': 'Virginia', 'value': 'Virginia'},
    {'label': 'Washington', 'value': 'Washington'},
    {'label': 'West Virginia', 'value': 'West Virginia'},
    {'label': 'Wisconsin', 'value': 'Wisconsin'},
    {'label': 'Wyoming', 'value': 'Wyoming'}],
    "Investment Type": [{'label': 'Combo Grant/Loan', 'value': 'Combo Grant/Loan'}, {'label': 'Direct Loan', 'value': 'Direct Loan'}, {'label': 'Grant', 'value': 'Grant'}, {'label': 'Loan Guarantee', 'value': 'Loan Guarantee'}, {'label': 'Payment', 'value': 'Payment'}, {'label': 'Unknown', 'value': 'Unknown'}],
    "Year": [{'label': '2017', 'value': '2017'}, {'label': '2018', 'value': '2018'}, {'label': '2019', 'value': '2019'}, {'label': '2020', 'value': '2020'}, {'label': '2021', 'value': '2021'}],
    "Energy Type": [{'label': 'Anaerobic Digester', 'value': 'Anaerobic Digester'}, {'label': 'Energy Efficiency', 'value': 'Energy Efficiency'}, {'label': 'Geothermal', 'value': 'Geothermal'}, {'label': 'Hydroelectric', 'value': 'Hydroelectric'}, {'label': 'Hydrogen', 'value': 'Hydrogen'}, {'label': 'Other', 'value': 'Other'}, {'label': 'Renewable Biomass', 'value': 'Renewable Biomass'}, {'label': 'Solar', 'value': 'Solar'}, {'label': 'Wind', 'value': 'Wind'}]
  }


  public aggregates: Item[] = [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "Min", value: "min" }, { label: "Max", value: "max" }]

  public maxList = { "Amount Invested": { "mean": 60000000, "sum": 4000000000, "min": 25000000, "max": 250000000 }, "Number of Projects": { "mean": 750, "sum": 21000, "min": 750, "max": 750 } };

  public currentVisualizationState: { [characterName: string]: any } = {
    "VISUALIZATION": "bar",
    "Values": [],
    "x-Axis": [],
    "Color": [],
    "ColorElements": [],
    "Highlight": "",
    "CheckedHighlight": { "Number of Projects": false, "Amount Invested": false, },
    "ColorHighlight": [],
    "Filter": [],
    "ActiveFilter":{"Energy Type": false, "State":  false, "Party of Governor":  false, "Investment Type":  false, "Year":  false, "Number of Projects":  false, "Amount Invested":  false},
    "FilterC": { "Party of Governor": [], "State": [], "Investment Type": [], "Energy Type": [], "Year": [] },
    "FilterN": { "Amount Invested": [0, 4000000000], "Number of Projects": [0, 21000] },
    "FilterNActive": { "Amount Invested": [false, false], "Number of Projects": [false, false] },
    "Aggregate": { "Amount Invested": "sum", "Number of Projects": "sum" },
    "Datafields": []
  }

  public possibleVisualizationStates = []


  constructor(private ngxCsvParser: NgxCsvParser) { }


  async createVisualization(that, visualizationState, target, type) {

    if(that.overallMode == 0 && type == "large"){
      visualizationState = await that.training.changeAmbiguityInterpretation(that, that.training.possibleActions[that.training.selectedAmbiguity])
    }

    //console.log(target)
    //console.log(visualizationState)

    if(typeof(this.retry[target]) == "undefined"){
      this.retry[target] = 1
    }
    else{
      this.retry[target] += 1
    }
    


    var vegaLiteSpecification : any = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "background": "#f7f8f9",
      "width": "container",
      "height": "container",
      "transform": [
      ],
      "autosize": {
        "type": "fit",
        "contains": "padding"
      },
      "params": [
      ],
      "data": {
        "values": [],
        "format": {
          "type": "json"
        }
      },
      "encoding": {
        "x": {}, "color": {},
        "strokeWidth": {
        }
      },
      "resolve": { "scale": { "y": "independent" } }

    };

    if (visualizationState['x-Axis'].length > 0 || visualizationState["Values"].length > 0 || visualizationState['Color'].length > 0) {
      vegaLiteSpecification.data.values = data
    }



    var opacity = {}
    var strokeOpacity = {}
    var fillOpacity = {}
    var params = []
    var tooltip: any[] = []
    var width = 0;
    var size = 0;
    var fontSizeLegend = type == "large" ? 11 : 6
    var fontSizeTitle = type == "large" ? 11 : 8
    var fontSizeLabel = type == "large" ? 11 : 3
    var symbolSize = type == "large" ? 100 : 20
    var markSize = type == "large" ? 30 : 6

    var rowPadding = type == "large" ? 1 : 0

    if(type == "large"){
      visualizationState['x-Axis'].forEach(element => {
        if (this.dataFieldsConfig[element] == "quantitative") {
          tooltip.push({ "field": element, "type": this.dataFieldsConfig[element] })
        } else { tooltip.push({ "field": element, "type": "nominal" }) }
      })
      visualizationState['Color'].forEach(element => {
        if (this.dataFieldsConfig[element] == "quantitative") {
          tooltip.push({ "field": element, "type": this.dataFieldsConfig[element] })
        } else { tooltip.push({ "field": element, "type": "nominal" }) }
      })  
    }

    /***
     * If this chart is specified as a bar Chart
     */
    if (visualizationState["VISUALIZATION"] == "bar") {

      if (visualizationState['x-Axis'].length >= 1) {
        vegaLiteSpecification.encoding.x = { "field": visualizationState['x-Axis'][0], "type": "ordinal", "axis": { "labelPadding": 0, "labelOverlap": "true" , "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel} }

        if (this.dataFieldsConfig[visualizationState['x-Axis'][0]] == "quantitative") {
          vegaLiteSpecification.encoding.x.type = "quantitative"
          vegaLiteSpecification.encoding.x.scale = { "domainMin": 0 }
        }
        else if (visualizationState['FilterC'][visualizationState['x-Axis'][0]].length >= 1) {
          width = type == "large" ? this.baseWidth / visualizationState['FilterC'][visualizationState['x-Axis'][0]].length : this.targetWidth / visualizationState['FilterC'][visualizationState['x-Axis'][0]].length
        }
      }

      if (visualizationState['Color'].length >= 1) {
        vegaLiteSpecification.encoding.color = { "field": visualizationState['Color'][0] , "legend": {"titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLegend, "symbolSize": symbolSize, "rowPadding": rowPadding}}
      }


      if (visualizationState["Values"].length >= 1) {
        size = (width / visualizationState["Values"].length)
        vegaLiteSpecification.layer = []
      }
      else {
        vegaLiteSpecification.mark = { "type": "tick" }
      }

      for (var i = 0; i < visualizationState["Values"].length; i++) {
        var offSet = -(width / 2) + size / 2 + (size * i)

        if (visualizationState['Color'].length >= 1 && type == "large") {
          opacity = {
            "condition": { "param": "legendSelect" + i, "value": 1 },
            "value": 0.2
          }

          params = [{
            "name": "legendSelect" + i,
            "select": { "type": "point", "fields": [visualizationState['Color'][0]] },
            "bind": "legend"
          }]

          if (visualizationState['ColorHighlight'].length > 0) {
            params[0]["value"] = {[visualizationState['Color'][0]]: visualizationState['ColorHighlight']}
          }
        }
        if (visualizationState['Color'].length >= 1) {

          if (visualizationState['ColorHighlight'].length > 0) {
              opacity = {
                "condition": { "test": { "field": visualizationState['Color'][0] , "oneOf": visualizationState['ColorHighlight'] }, "value": 1 },
                "value": 0.2
              }

          }
        }

        if (this.dataFieldsConfig[visualizationState["Values"][i]] == "quantitative") {

          fillOpacity = {
            "condition": { "test": (visualizationState["Values"][i] == visualizationState['Highlight'] || visualizationState['Highlight'] == "").toString(), "value": 1 },
            "value": 0.4
          }

          if (this.dataFieldsConfig[visualizationState['x-Axis'][0]] == "quantitative") {
            vegaLiteSpecification.layer.push(
              {
                "mark": {
                  "type": visualizationState["VISUALIZATION"]
                },
                "encoding": {

                  "y": { "field": visualizationState["Values"][i], "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], "axis": { "labelOverlap": "true" , "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel} },
                  "tooltip": type != "large" ? [] : tooltip.concat({ "field": visualizationState["Values"][i], "type": this.dataFieldsConfig[visualizationState["Values"][i]], "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], }),
                  "opacity": opacity,
                  "fillOpacity": fillOpacity,

                },
                "params": params
              }
            )
          }
          else {
            vegaLiteSpecification.layer.push(
              {
                "mark": {
                  "type": visualizationState["VISUALIZATION"], "size": size * 0.9, "xOffset": offSet
                },
                "encoding": {

                  "y": { "field": visualizationState["Values"][i], "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], "axis": { "labelOverlap": "true", "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel} },
                  "tooltip": type != "large" ? [] : tooltip.concat({ "field": visualizationState["Values"][i], "type": this.dataFieldsConfig[visualizationState["Values"][i]], "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], }),
                  "opacity": opacity,
                  "fillOpacity": fillOpacity,

                },
                "params": params
              }
            )
          }
        }
        else {
          vegaLiteSpecification.layer.push(
            {
              "mark": {
                "type": visualizationState["VISUALIZATION"], "size": size * 0.9, "xOffset": offSet
              },
              "encoding": {

                "y": { "field": visualizationState["Values"][i], "axis": { "labelOverlap": "true", "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel } },
                "tooltip": type != "large" ? [] : tooltip.concat({ "field": visualizationState["Values"][i], "type": "nominal", "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], })

              }
            }
          )
        }
      }
    }

    /***
     * If this chart is specified as a point or line Chart
     */
    else if (visualizationState["VISUALIZATION"] == "point" || visualizationState["VISUALIZATION"] == "line") {
      vegaLiteSpecification.encoding.strokeWidth = {
        "value": 2
      }

      if (visualizationState['x-Axis'].length >= 1) {
        if (this.dataFieldsConfig[visualizationState['x-Axis'][0]] == "quantitative") {
          vegaLiteSpecification.encoding.x = { "field": visualizationState['x-Axis'][0], "type": this.dataFieldsConfig[visualizationState['x-Axis'][0]], "axis": { "labelPadding": 0, "labelOverlap": "true", "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel } }
        }
        else {
          vegaLiteSpecification.encoding.x = { "field": visualizationState['x-Axis'][0], "type": "nominal", "axis": { "labelPadding": 0, "labelOverlap": "true", "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel } }

        }

      }
      if (visualizationState['Color'].length >= 1) {
        vegaLiteSpecification.encoding.color = { "field": visualizationState['Color'][0] , "legend": {"titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLegend, "symbolSize": symbolSize, "rowPadding": rowPadding}}

      }

      if (visualizationState["Values"].length >= 1) {
        vegaLiteSpecification.layer = []
      }
      else {
        vegaLiteSpecification.mark = { "type": visualizationState["VISUALIZATION"], "size": markSize }
      }

      for (var i = 0; i < visualizationState["Values"].length; i++) {
        /*if (visualizationState['Color'].length >= 1) {
          vegaLiteSpecification.encoding.color = { "field": visualizationState['Color'][0] , "legend": {"titleFontSize": fontSize, "labelFontSize": fontSize, "symbolSize": symbolSize}}

        }*/
        if (this.dataFieldsConfig[visualizationState["Values"][i]] == "quantitative") {

          strokeOpacity = {
            "condition": { "test": (visualizationState["Values"][i] == visualizationState['Highlight'] || visualizationState['Highlight'] == "").toString(), "value": 1 },
            "value": 0.4
          }

          if (visualizationState['Color'].length >= 1 && type == "large") {

            params = [{
              "name": "legendSelect" + i,
              "select": { "type": "point", "fields": [visualizationState['Color'][0]] },
              "bind": "legend"
            }]

            if (visualizationState['ColorHighlight'].length > 0) {
              params[0]["value"] = {[visualizationState['Color'][0]]: visualizationState['ColorHighlight']}

              opacity = {
                "condition": { "test": { "field": visualizationState['Color'][0] , "oneOf": visualizationState['ColorHighlight'] }, "value": 1 },
                "value": 0.2
              }
            }
          }

          if (visualizationState['Color'].length >= 1 && type == "small") {


            params = [{
              "name": "legendSelect" + i + target,
              "select": { "type": "point", "fields": [visualizationState['Color'][0]] },
              "bind": "legend"
            }]

            if (visualizationState['ColorHighlight'].length > 0) {
              params[0]["value"] = {[visualizationState['Color'][0]]: visualizationState['ColorHighlight']}

              opacity = {
                "condition": { "test": { "field": visualizationState['Color'][0] , "oneOf": visualizationState['ColorHighlight'] }, "value": 1 },
                "value": 0.2
              }
            }

            /*if (Object.keys(visualizationState['ColorHighlight']).length > 0) {
                opacity = {
                  "condition": { "test": { "field": visualizationState['Color'][0] , "oneOf": visualizationState['ColorHighlight'][visualizationState['Color'][0]] }, "value": 1 },
                  "value": 0.2
                }
  
            }*/
          }
          var mark: any = {
            "type": visualizationState["VISUALIZATION"], "size": markSize 
          }

          if (visualizationState["VISUALIZATION"] == "line") {
            mark = {
              "type": visualizationState["VISUALIZATION"],
              "point": {
                "filled": false,
                "fill": "white", 
                "size": markSize 
              }
              
            }
          }



          vegaLiteSpecification.layer.push(
            {
              "mark": mark,
              "encoding": {

                "y": { "field": visualizationState["Values"][i], "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], "axis": { "labelOverlap": "true", "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel } },
                "tooltip": type != "large" ? [] : tooltip.concat({ "field": visualizationState["Values"][i], "type": this.dataFieldsConfig[visualizationState["Values"][i]], "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], }),
                "opacity": opacity,
                "strokeOpacity": strokeOpacity,
              },
              "params": params
            }
          )
        }
        else {
          vegaLiteSpecification.layer.push(
            {
              "mark": {
                "type": visualizationState["VISUALIZATION"], "size": markSize 
              },
              "encoding": {

                "y": { "field": visualizationState["Values"][i], "axis": { "labelOverlap": "true", "titleFontSize": fontSizeTitle, "labelFontSize": fontSizeLabel } },
                "tooltip": type != "large" ? [] : tooltip.concat({ "field": visualizationState["Values"][i], "type": "nominal", "aggregate": visualizationState['Aggregate'][visualizationState["Values"][i]], })

              }
            }
          )
        }

      }

    }

    vegaLiteSpecification.transform = [
      { "filter": { "field": "Party of Governor", "oneOf": visualizationState['FilterC']["Party of Governor"] } },
      { "filter": { "field": "Energy Type", "oneOf": visualizationState['FilterC']["Energy Type"] } },
      { "filter": { "field": "State", "oneOf": visualizationState['FilterC']["State"] } },
      { "filter": { "field": "Investment Type", "oneOf": visualizationState['FilterC']["Investment Type"] } },
      { "filter": { "field": "Year", "oneOf": visualizationState['FilterC']["Year"] } },
      { "filter": { "field": "Amount Invested", "range": visualizationState['FilterN']["Amount Invested"] } },
      { "filter": { "field": "Number of Projects", "range": visualizationState['FilterN']["Number of Projects"] } }
    ]

    if (visualizationState["Values"].length == 0 && visualizationState['x-Axis'].length > 0) {
      if (visualizationState['Color'].length == 0) {
        vegaLiteSpecification.transform.push(
          {
            "pivot": "Population",
            "value": visualizationState['x-Axis'][0],
            "groupby": visualizationState['x-Axis']
          }
        )
      }
      else {
        vegaLiteSpecification.transform.push(
          {
            "pivot": "Population",
            "value": visualizationState['x-Axis'][0],
            "groupby": visualizationState['x-Axis'].concat(visualizationState['Color'])
          }
        )
      }

    }
    else if (visualizationState["Values"].length == 0 && visualizationState['Color'].length > 0) {
      vegaLiteSpecification.transform.push(
        {
          "pivot": "Population",
          "value": visualizationState['Color'][0],
          "groupby": visualizationState['Color']
        }
      )
    }
    /*if(target == "#vis"){
      console.log(vegaLiteSpecification)

    }*/
    vegaEmbed(target, vegaLiteSpecification, { "actions": false, "mode": "vega-lite", "renderer": type == "large" ? "svg" : "png" }).then(function (result: any) {

      var width = result.view.getState()["signals"]["width"]
      if (visualizationState["Values"].length >= 1 ) {
        if(type == "large" && Math.abs(width - this.baseWidth)/this.baseWidth > 0.1 && this.retry[target] < 3){
          //console.log(this.baseWidth)
          //console.log(width)
          this.baseWidth = width
          this.createVisualization(that, visualizationState, target, type)
        }
        else if(type == "small" && Math.abs(width - this.targetWidth)/this.targetWidth > 0.1 && this.retry[target] < 2){
          //console.log(this.targetWidth)
          //console.log(width)
          this.targetWidth = width
          this.createVisualization(that, visualizationState, target, type)
        }
        else{
          this.retry[target] = 0
        }
        
      }
      else{
        this.retry[target] = 0
      }

      if (type == "large") {
        result.view.addEventListener('click', function (event, item) {
          if (typeof (item) != 'undefined' && "description" in item && visualizationState["Values"].length > 1 && that.overallMode != 1 ) {
            for(var i = 0; i < visualizationState["Values"].length; i++){
              if(String(item["description"]).indexOf(visualizationState["Values"][i]) != -1){
                that.infoVisInteraction.addAxisHighlight(that, visualizationState, visualizationState["Values"][i], true, null)
              }
            }
            this.createVisualization(that, visualizationState, "#vis", "large");
          }
        }.bind(this));


        if (visualizationState['Color'].length > 0 && visualizationState["Values"].length >= 1) {
          result.view.addSignalListener("legendSelect0", function (name, value) {
            if (Object.keys(value).length > 0 && !visualizationState['ColorHighlight'].includes(value[visualizationState['Color'][0]][0])) {
              that.infoVisInteraction.addLegendHighlight(that, visualizationState, value[visualizationState['Color'][0]], true, null)
            }
            else if(Object.keys(value).length > 0){
              that.infoVisInteraction.removeLegendHighlight(that, visualizationState, value[visualizationState['Color'][0]], true, null)
            }
            else {
              that.infoVisInteraction.removeLegendHighlight(that, visualizationState, ["ALL"], true, null)
            }
            this.createVisualization(that, visualizationState, "#vis", "large");
          }.bind(this))
        }

        var highlightElements = document.getElementsByClassName("colorHighlightElement")
        for (var i = highlightElements.length - 1; 0 <= i; i--) {
          var element = highlightElements[i];
          if(element["id"] != "ColorHighlightTemplate"){
            element.parentNode.removeChild(element);
          }
        }

        var visibleColorElements = document.querySelector(".mark-group.role-scope")
        if(visibleColorElements){
          visualizationState["ColorElements"] = []
          for(var i = 0; i < visibleColorElements.children.length; i++){            
            var text = visibleColorElements.children[i].children[1].children[1].children[0].textContent
            visualizationState["ColorElements"].push(text)

            var clone = document.getElementById('ColorHighlightTemplate').cloneNode(true);
            clone["id"] = "ColorHighlight_" + text

            var bounds = visibleColorElements.children[i].getBoundingClientRect()

            if(that.overallMode != 1){
              clone["style"]["pointer-events"] = "none"
            }

            clone["style"]["display"] = "block"
            clone["style"]["top"] = bounds.top.toString() + "px"
            clone["style"]["left"] = bounds.left.toString() + "px"
            clone["style"]["width"] = bounds.width.toString() + "px"
            clone["style"]["height"] = bounds.height.toString() + "px"
            document.body.appendChild(clone)
          }

          var highlightElements = document.getElementsByClassName("colorHighlightElement")

          
        }

        var visiblexAxis = document.getElementsByClassName("role-axis")
        for (var j = 0; j < visiblexAxis.length; j++){
          if(visiblexAxis[j]["ariaLabel"] != null && visiblexAxis[j]["ariaLabel"].startsWith("X-axis")){
            for(var i = 0; i < visiblexAxis[j].children[0].children[1].children[1].children.length; i++){
              var text = visiblexAxis[j].children[0].children[1].children[1].children[i].textContent
              visiblexAxis[j].children[0].children[1].children[1].children[i].id = "Canvas_x-Axis_"+ visualizationState["x-Axis"][0] + "_" + text
            }
            
          }
        }
        
      }

      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    }.bind(this)).catch((error: any) => {
      console.error(error);
    });

  }





}
