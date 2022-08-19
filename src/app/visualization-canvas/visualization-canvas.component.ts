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
export class VisualizationCanvasComponent implements OnInit {

  @Output() receiveData = new EventEmitter<any>();

  public baseWidth = 860
  public targetWidth = 100

  public csvRecords: any[] = [];
  public header = false;

  public retry = {"#vis": 0}

  public mode = "current"


  //Visualization 

  public dataFields = ['Projects', 'Amount', 'State', 'Energy Type', 'Party of Governor', 'Investment Type', 'Year']

  public dataFieldsConfig: { [characterName: string]: string } = {

    "Energy Type": "nominal",
    "State": "nominal",
    "Party of Governor": "nominal",
    "Investment Type": "nominal",
    "Year": "temporal",
    "Projects": "quantitative",
    "Amount": "quantitative",
    //"Population": "quantitative"
  }

  public currentVisualizationState: { [characterName: string]: any } = {
    "VISUALIZATION": "bar",
    "Datafields": [],
    "Values": [],
    "x-Axis": [],
    "Color": [],
    "Highlight": "",
    "CheckedHighlight": { "Projects": false, "Amount": false, },
    "ColorHighlight": {},
    "Filter": [],
    "FilterC": { "Party of Governor": [], "State": [], "Investment Type": [], "Energy Type": [], "Year": [] },
    "FilterN": { "Amount": [0, 4000000000], "Projects": [0, 21000] },
    "FilterNActive": { "Amount": [false, false], "Projects": [false, false] },
    "Aggregate": { "Amount": "sum", "Projects": "sum" }
  }

  public possibleVisualizationStates = []


  public optionDictionary: { [characterName: string]: Item[] } = {
    "Party of Governor": [{ label: "Republican", value: "Republican" }, { label: "Democratic", value: "Democratic" }, { label: "Independant", value: "Independant" }],
    "State": [{ label: "Alaska", value: "Alaska" }, { label: "Illinois", value: "Illinois" }, { label: "New York", value: "New York" }, { label: "Maine", value: "Maine" }, { label: "Texas", value: "Texas" }, { label: "North Carolina", value: "North Carolina" }, { label: "Washington", value: "Washington" }, { label: "Iowa", value: "Iowa" }, { label: "New Jersey", value: "New Jersey" }, { label: "Minnesota", value: "Minnesota" }, { label: "Idaho", value: "Idaho" }, { label: "California", value: "California" }, { label: "Wyoming", value: "Wyoming" }, { label: "Pennsylvania", value: "Pennsylvania" }, { label: "Arizona", value: "Arizona" }, { label: "Florida", value: "Florida" }, { label: "Colorado", value: "Colorado" }, { label: "Hawaii", value: "Hawaii" }, { label: "Michigan", value: "Michigan" }, { label: "Vermont", value: "Vermont" }, { label: "Wisconsin", value: "Wisconsin" }, { label: "Oregon", value: "Oregon" }, { label: "Kansas", value: "Kansas" }, { label: "Kentucky", value: "Kentucky" }, { label: "Georgia", value: "Georgia" }, { label: "Massachusetts", value: "Massachusetts" }, { label: "Virginia", value: "Virginia" }, { label: "Missouri", value: "Missouri" }, { label: "Rhode Island", value: "Rhode Island" }, { label: "Alabama", value: "Alabama" }, { label: "Tennessee", value: "Tennessee" }, { label: "Mississippi", value: "Mississippi" }, { label: "Ohio", value: "Ohio" }, { label: "Indiana", value: "Indiana" }, { label: "Nebraska", value: "Nebraska" }, { label: "Oklahoma", value: "Oklahoma" }, { label: "Arkansas", value: "Arkansas" }, { label: "South Dakota", value: "South Dakota" }, { label: "North Dakota", value: "North Dakota" }, { label: "New Hampshire", value: "New Hampshire" }, { label: "Maryland", value: "Maryland" }, { label: "West Virginia", value: "West Virginia" }, { label: "Louisiana", value: "Louisiana" }, { label: "New Mexico", value: "New Mexico" }, { label: "Montana", value: "Montana" }, { label: "Utah", value: "Utah" }, { label: "South Carolina", value: "South Carolina" }, { label: "Connecticut", value: "Connecticut" }, { label: "Puerto Rico", value: "Puerto Rico" }, { label: "Nevada", value: "Nevada" }, { label: "Delaware", value: "Delaware" }],
    "Investment Type": [{ label: "Direct Loan", value: "Direct Loan" }, { label: "Grant", value: "Grant" }, { label: "Unknown", value: "Unknown" }, { label: "Payment", value: "Payment" }, { label: "Loan Guarantee", value: "Loan Guarantee" }, { label: "Combo Grant/Loan", value: "Combo Grant/Loan" }],
    "Year": [{ label: "2021", value: "2021" }, { label: "2020", value: "2020" }, { label: "2019", value: "2019" }, { label: "2018", value: "2018" }, { label: "2017", value: "2017" }],
    "Energy Type": [{ label: "Hydroelectric", value: "Hydroelectric" }, { label: "Solar", value: "Solar" }, { label: "Energy Efficiency", value: "Energy Efficiency" }, { label: "Anaerobic Digester", value: "Anaerobic Digester" }, { label: "Renewable Biomass", value: "Renewable Biomass" }, { label: "Other", value: "Other" }, { label: "Wind", value: "Wind" }, { label: "Hydrogen", value: "Hydrogen" }, { label: "Geothermal", value: "Geothermal" }]
  }


  public aggregates: Item[] = [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "Min", value: "min" }, { label: "Max", value: "max" }]

  public maxList = { "Amount": { "mean": 60000000, "sum": 4000000000, "min": 25000000, "max": 250000000 }, "Projects": { "mean": 750, "sum": 21000, "min": 750, "max": 750 } };



  constructor(private ngxCsvParser: NgxCsvParser) { }

  ngOnInit(): void {

    for (var element in this.optionDictionary) {
      this.optionDictionary[element].forEach(item => this.currentVisualizationState['FilterC'][element].push(item["value"]))
    }
  }

  createVisualization(that, visualizationState, target, type) {

    if(typeof(this.retry[target]) === undefined){
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

          if (Object.keys(visualizationState['ColorHighlight']).length > 0) {
            params[0]["value"] = visualizationState['ColorHighlight']
          }
        }
        if (visualizationState['Color'].length >= 1 && type == "tall") {

          if (Object.keys(visualizationState['ColorHighlight']).length > 0) {
              opacity = {
                "condition": { "test": "visualizationState['ColorHighlight']['" + visualizationState['Color'][0] +"'].includes(datum['" + visualizationState['Color'][0] +"'])", "value": 1 },
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

            if (Object.keys(visualizationState['ColorHighlight']).length > 0) {
              params[0]["value"] = visualizationState['ColorHighlight']

              opacity = {
                "condition": { "test": { "field": visualizationState['Color'][0] , "oneOf": visualizationState['ColorHighlight'][visualizationState['Color'][0]] }, "value": 1 },
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

            if (Object.keys(visualizationState['ColorHighlight']).length > 0) {
              params[0]["value"] = visualizationState['ColorHighlight']

              opacity = {
                "condition": { "test": { "field": visualizationState['Color'][0] , "oneOf": visualizationState['ColorHighlight'][visualizationState['Color'][0]] }, "value": 1 },
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
      { "filter": { "field": "Amount", "range": visualizationState['FilterN']["Amount"] } },
      { "filter": { "field": "Projects", "range": visualizationState['FilterN']["Projects"] } }
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

    console.log(vegaLiteSpecification)

    vegaEmbed(target, vegaLiteSpecification, { "actions": false, "mode": "vega-lite", "renderer": type == "large" ? "svg" : "png" }).then(function (result: any) {

      var width = result.view.getState()["signals"]["width"]
      if (visualizationState["Values"].length >= 1 && this.retry[target] < 4) {
        if(type == "large" && Math.abs(width - this.baseWidth)/this.baseWidth > 0.1){
          console.log(this.baseWidth)
          console.log(width)
          this.baseWidth = width
          this.createVisualization(that, visualizationState, target, type)
        }
        else if(type == "small" && Math.abs(width - this.targetWidth)/this.targetWidth > 0.1){
          console.log(this.targetWidth)
          console.log(width)
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
          if (typeof (item) != 'undefined' && "description" in item) {
            that.infoVisInteraction.addAxisHighlight(that, visualizationState, item["description"].split("; ")[1].split(" ")[2].slice(0, -1), true)
            this.createVisualization(that, visualizationState, "#vis", "large");
          }
        }.bind(this));


        if (visualizationState['Color'].length > 0 && visualizationState["Values"].length >= 1) {
          result.view.addSignalListener("legendSelect0", function (name, value) {
            if (Object.keys(value).length > 0) {
              that.infoVisInteraction.addLegendHighlight(that, visualizationState, value[visualizationState['Color'][0]], true)
            }
            else {
              that.infoVisInteraction.removeLegendHighlight(that, visualizationState, ["ALL"], true)
            }
            this.createVisualization(that, visualizationState, "#vis", "large");
          }.bind(this))
        }
      }

      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    }.bind(this)).catch((error: any) => {
      console.error(error);
    });

  }





}
