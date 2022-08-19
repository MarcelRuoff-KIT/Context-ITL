import { Injectable } from '@angular/core';
import { forEach } from 'vega-lite/build/src/encoding';

@Injectable()
export class InfoVisInteractionService {

  constructor() { }


  async processAction(that, visualizationState, action, unique) {

    Object.keys(action).forEach(key => {
      if (key == "VISUALIZATION") {
        if (action["VISUALIZATION"]["ADD"].length > 0) {
          this.changeVisualization(that, visualizationState, action["VISUALIZATION"]["ADD"][0], unique)
        }
      }
      else if (key == "Aggregate") {
        for (var element in action["Aggregate"]["ADD"]) {
          if (action["Aggregate"]["ADD"][element]["KEY"] == "ALL") {
            for (var index in visualizationState["Values"]) {
              this.changeAggregate(that, visualizationState, visualizationState["Values"][index], action["Aggregate"]["ADD"][element]["ID"], false)
            }
            if(unique && that.correctionMode){
              that.training.adaptActionList(that, visualizationState, "x-Axis", "ADD", [{"KEY": "ALL", "ID": action["Aggregate"]["ADD"][element]["ID"]}])
            }
          }
          else {
            this.changeAggregate(that, visualizationState, action["Aggregate"]["ADD"][element]["KEY"], action["Aggregate"]["ADD"][element]["ID"], unique)
          }
        }

      }
      else if (key == "x-Axis") {
        console.log(key)
        if (action["x-Axis"]["REMOVE"].includes("ALL")) {
          this.removeXAxis(that, visualizationState, action["x-Axis"]["REMOVE"], unique)
        }
        if (!action["x-Axis"]["ADD"].includes("ALL")) {
          this.addXAxis(that, visualizationState, action["x-Axis"]["ADD"], unique)
        }
        if (!action["x-Axis"]["REMOVE"].includes("ALL")) {
          this.removeXAxis(that, visualizationState, action["x-Axis"]["REMOVE"], unique)
        }
      }
      else if (key == "Values") {
        console.log(key)
        if (action["Values"]["REMOVE"].includes("ALL")) {
          this.removeValues(that, visualizationState, action["Values"]["REMOVE"], unique)
        }
        if (!action["Values"]["ADD"].includes("ALL")) {
          this.addValues(that, visualizationState, action["Values"]["ADD"], unique)
        }
        if (!action["Values"]["REMOVE"].includes("ALL")) {
          this.removeValues(that, visualizationState, action["Values"]["REMOVE"], unique)
        }
      }
      else if (key == "Color") {
        console.log(key)
        if (action["Color"]["REMOVE"].includes("ALL")) {
          this.removeLegends(that, visualizationState, action["Color"]["REMOVE"], unique)
        }
        if (!action["Color"]["ADD"].includes("ALL")) {
          this.addLegends(that, visualizationState, action["Color"]["ADD"], unique)
        }
        if (!action["Color"]["REMOVE"].includes("ALL")) {
          this.removeLegends(that, visualizationState, action["Color"]["REMOVE"], unique)
        }
      }
      else if (key == "Highlight") {
        console.log(key)
        if (action["Highlight"]["ADD"].includes("ALL")) {
          this.addAxisHighlight(that, visualizationState, action["Highlight"]["ADD"], unique)
        }
        if (action["Highlight"]["REMOVE"].includes("ALL")) {
          this.removeAxisHighlight(that, visualizationState, action["Highlight"]["REMOVE"], unique)
        }
        if (!action["Highlight"]["ADD"].includes("ALL")) {
          this.addAxisHighlight(that, visualizationState, action["Highlight"]["ADD"], unique)
        }
        if (!action["Highlight"]["REMOVE"].includes("ALL")) {
          this.removeAxisHighlight(that, visualizationState, action["Highlight"]["REMOVE"], unique)
        }
      }
      else if (key == "ColorHighlight") {
        console.log(key)
        if (action["ColorHighlight"]["ADD"].includes("ALL")) {
          this.addLegendHighlight(that, visualizationState, action["ColorHighlight"]["ADD"], unique)
        }
        if (action["ColorHighlight"]["REMOVE"].includes("ALL")) {
          this.removeLegendHighlight(that, visualizationState, action["ColorHighlight"]["REMOVE"], unique)
        }
        if (!action["ColorHighlight"]["ADD"].includes("ALL")) {
          this.addLegendHighlight(that, visualizationState, action["ColorHighlight"]["ADD"], unique)
        }
        if (!action["ColorHighlight"]["REMOVE"].includes("ALL")) {
          this.removeLegendHighlight(that, visualizationState, action["ColorHighlight"]["REMOVE"], unique)
        }
      }
      else if (key == "Filter") {
        console.log(key)
        if (action["Filter"]["ADD"].includes("ALL")) {
          this.openingFilters(that, visualizationState, action["Filter"]["ADD"], unique)
        }
        if (action["Filter"]["REMOVE"].includes("ALL")) {
          this.removeFilters(that, visualizationState, action["Filter"]["REMOVE"], unique)
        }
        if (!action["Filter"]["ADD"].includes("ALL")) {
          this.openingFilters(that, visualizationState, action["Filter"]["ADD"], unique)
        }
        if (!action["Filter"]["REMOVE"].includes("ALL")) {
          this.removeFilters(that, visualizationState, action["Filter"]["REMOVE"], unique)
        }
      }
      else if (key == "FilterN") {
        this.changeNumFilter(that, visualizationState, action["FilterN"]["ADD"], "ADD", unique)
        this.changeNumFilter(that, visualizationState, action["FilterN"]["REMOVE"], "REMOVE", unique)
      }
      else if (key == "FilterC") {
        this.addCatFilter(that, visualizationState, action["FilterC"]["ADD"].filter(element => element["ID"].includes("ALL")), unique)
        this.removeCatFilter(that, visualizationState, action["FilterC"]["REMOVE"].filter(element => element["ID"].includes("ALL")), unique)
        this.addCatFilter(that, visualizationState, action["FilterC"]["ADD"].filter(element => !element["ID"].includes("ALL")), unique)
        this.removeCatFilter(that, visualizationState, action["FilterC"]["REMOVE"].filter(element => !element["ID"].includes("ALL")), unique)
      }
    })

  }


  /**
 * Encodings
 */


  /**
   * Change Visualization
   */
  changeVisualization(that: any, visualizationState: any, target: string, unique: boolean) {
    
    visualizationState["VISUALIZATION"] = target;

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "VISUALIZATION", "ADD", target)
    
    var current = document.getElementsByClassName("p-button-raised p-button-secondary active");
    if (current.length > 0) {
      current[0].className = current[0].className.replace(" active", "");
    }
    document.getElementById(target).childNodes[0]["className"] += " active";
  }
  }


  

  /**
   * Change Aggregate
   */

   changeAggregate(that: any, visualizationState: any, dataField: string, aggregate: string, unique: boolean) {



    visualizationState['Aggregate'][dataField] = aggregate


    for (var i = 0; i < Object.keys(that.visCanvas.maxList[dataField]).length; i++) {
      if (that.visCanvas.maxList[dataField][Object.keys(that.visCanvas.maxList[dataField])[i]] == visualizationState['FilterN'][dataField][1]) {
        visualizationState['FilterN'][dataField][1] = that.visCanvas.maxList[dataField][aggregate]
        break;
      }
    }

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Aggregate", "ADD", [{"KEY": dataField, "ID": aggregate}])
    }
  }

  /**
   * Change x-Axis
   */

  addXAxis(that: any, visualizationState: any, dataFields: string[], unique: boolean) {


    //remove previous xAxis
    this.removeXAxis(that, visualizationState, visualizationState['x-Axis'], false)

    dataFields.forEach((dataField: string) => {
      if (visualizationState['x-Axis'].includes(dataField)) {
        this.removeXAxis(that, visualizationState, [dataField], false)
      }
      else if (visualizationState["Values"].includes(dataField)) {
        this.removeValues(that, visualizationState, [dataField], false)

      }
      else if (visualizationState['Color'].includes(dataField)) {
        this.removeLegends(that, visualizationState, [dataField], false)

      }
    })

    if (dataFields.length > 0) {
      visualizationState['x-Axis'] = [dataFields[0]]

      visualizationState['Datafields'].push(dataFields[0])
      visualizationState['Datafields'] = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    }


    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "x-Axis", "ADD", dataFields)
    }
  }

  removeXAxis(that: any, visualizationState: any, dataFields: string[], unique: boolean) {


    var mediateFields = JSON.parse(JSON.stringify(visualizationState['x-Axis']))
    visualizationState['x-Axis'] = mediateFields.filter((datafield: any) => !dataFields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => !dataFields.includes(datafield))


    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "x-Axis", "REMOVE", dataFields)
    }
  }

  /**
   * Change Values
   */

  addValues(that: any, visualizationState: any, dataFields: string[], unique: boolean) {
    
    var nonNumeric = false
    dataFields.forEach((dataField: string) => {
      if (that.visCanvas.dataFieldsConfig[dataField] == "quantitative") {
        if (visualizationState['x-Axis'].includes(dataField)) {
          this.removeXAxis(that, visualizationState, [dataField], false)

        }
        else if (visualizationState["Values"].includes(dataField)) {
          this.removeValues(that, visualizationState, [dataField], false)
        }
        else if (visualizationState['Color'].includes(dataField)) {
          this.removeLegends(that, visualizationState, [dataField], false)

        }
      }
    })

    for (var i = 0; i < dataFields.length; i++) {
      if (that.visCanvas.dataFieldsConfig[dataFields[i]] == "quantitative") {
        if (visualizationState["Values"].length >= 2) {
          this.removeValues(that, visualizationState, [visualizationState["Values"][0]], false)
        }

        visualizationState["Values"].push(dataFields[i])
        visualizationState["Values"] = JSON.parse(JSON.stringify(visualizationState["Values"]))
        visualizationState['Datafields'].push(dataFields[i])
        visualizationState['Datafields'] = JSON.parse(JSON.stringify(visualizationState['Datafields']))
      }
      else {
        nonNumeric = true
      }
    }

    if (nonNumeric) {
      that.showErrorMessage()
    }


    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Values", "ADD", dataFields)
    }
  }

  removeValues(that: any, visualizationState: any, dataFields: string[], unique: boolean) {
    

    var mediateFields = JSON.parse(JSON.stringify(visualizationState["Values"]))
    visualizationState["Values"] = mediateFields.filter((datafield: any) => !dataFields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => !dataFields.includes(datafield))

    visualizationState['Highlight'] = ""


    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Values", "REMOVE", dataFields)
    }
  }

  /**
   * Change Legend
   */

  addLegends(that: any, visualizationState: any, dataFields: string[], unique: boolean) {

    
    dataFields.forEach((dataField: string) => {
      if (visualizationState['x-Axis'].includes(dataField)) {
        this.removeXAxis(that, visualizationState, [dataField], false)

      }
      else if (visualizationState["Values"].includes(dataField)) {
        this.removeValues(that, visualizationState, [dataField], false)

      }
    })


    if (dataFields.length > 0) {
      visualizationState['Color'] = [dataFields[0]]

      if (!visualizationState['Datafields'].includes(dataFields[0])) {
        visualizationState['Datafields'].push(dataFields[0])

        visualizationState['ColorHighlight'] = { [visualizationState['Color'][0]]: visualizationState['FilterC'][visualizationState['Color'][0]] }

      }
      visualizationState['Datafields'] = JSON.parse(JSON.stringify(visualizationState['Datafields']))

    }


    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Color", "ADD", dataFields)
    }

  }

  removeLegends(that: any, visualizationState: any, dataFields: string[], unique: boolean) {

   

    var mediateFields = JSON.parse(JSON.stringify(visualizationState['Color']))
    visualizationState['Color'] = mediateFields.filter((datafield: any) => !dataFields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => !dataFields.includes(datafield))

    visualizationState['ColorHighlight'] = {}


    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Color", "REMOVE", dataFields)
    }
  }




  /**
   * Change Filter
   */

  removeFilters(that: any, visualizationState: any, dataFields: string[], unique: boolean) {
    if (dataFields.includes("ALL")) {
      dataFields = that.visCanvas.dataFields
    }

    dataFields.forEach(element => {
      visualizationState['Filter'] = visualizationState['Filter'].filter(filter => filter != element)

      if (that.visCanvas.dataFieldsConfig[element] == "quantitative") {
        visualizationState['FilterN'][element][1] = that.visCanvas.maxList[element][visualizationState['Aggregate'][element]]
      }
      else {
        visualizationState['FilterC'][element] = []
        that.visCanvas.optionDictionary[element].forEach((item: { [x: string]: any; }) => visualizationState['FilterC'][element].push(item["value"]))
      }
    })

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Filter", "REMOVE", dataFields)
    }
  }

  openingFilters(that: any, visualizationState: any, dataFields: string[], unique: boolean) {
    if (dataFields.includes("ALL")) {
      dataFields = that.visCanvas.dataFields
    }

    dataFields.forEach(element => {
      visualizationState['Filter'].unshift(element)
      visualizationState['Filter']= [...new Set(visualizationState['Filter'])];
    })

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Filter", "ADD", dataFields)
    }
  }

  changeNumFilter(that: any, visualizationState: any, filters: any[], verb: string, unique: boolean) {
    filters.forEach(element => {
      var target = element["Filter"]

      if(!visualizationState["Filter"].includes(target)){
        this.openingFilters(that, visualizationState, [target], false)
      }
      var range = visualizationState['FilterN'][target]

      if(verb == "ADD"){
        if (typeof (element["GT"]) != "undefined" && typeof (element["LT"]) != "undefined") {
          this.changeActiveFilter(that, visualizationState, target, 0, true, false)
          this.changeActiveFilter(that, visualizationState, target, 1, true, false)

          range = [parseInt(element["GT"]) , parseInt(element["LT"]) ]
        }
        else if(typeof (element["GT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 0, true, false)
          range = [parseInt(element["GT"]), that.visCanvas.maxList[target][visualizationState['Aggregate'][target]]]

        }
        else if(typeof (element["LT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 1, true, false)
          range = [0 , parseInt(element["LT"])]
        }
      }
      else if(verb == "REMOVE"){
        if (typeof (element["GT"]) != "undefined" && typeof (element["LT"]) != "undefined") {
          this.changeActiveFilter(that, visualizationState, target, 0, true, false)
          this.changeActiveFilter(that, visualizationState, target, 1, true, false)

          range = [parseInt(element["LT"]), parseInt(element["GT"])]
        }
        else if(typeof (element["GT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 1, true, false)
          range[1] = parseInt(element["GT"])

        }
        else if(typeof (element["LT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 0, true, false)
          range[0] = parseInt(element["LT"])
        }
      }

      visualizationState['FilterN'][target] = range

      if(unique && that.correctionMode){
        that.training.adaptActionList(that, visualizationState, "FilterN", verb, element)
      }
    })
  }

  addCatFilter(that: any, visualizationState: any, filters: any[], unique: boolean) {
    filters.forEach(element => {
      var target = element["KEY"]
      this.openingFilters(that, visualizationState, [target], false)

      if (element["ID"].includes("ALL")) {
        that.visCanvas.optionDictionary[target].forEach(item => visualizationState['FilterC'][target].push(item["value"]))
        visualizationState['FilterC'][target] = [...new Set(visualizationState['FilterC'][target])];
      }
      else {
        visualizationState['FilterC'][target] = visualizationState['FilterC'][target].concat(element["ID"])
      }

      if(unique && that.correctionMode){
        that.training.adaptActionList(that, visualizationState, "FilterC", "ADD", element)
      }

    })
  }


  removeCatFilter(that: any, visualizationState: any, filters: any[], unique: boolean) {
    filters.forEach(element => {
      var target = element["KEY"]

      this.openingFilters(that, visualizationState, [target], false)

      if (element["ID"].includes("ALL")) {
        visualizationState['FilterC'][target] = []
      }
      else {
        visualizationState['FilterC'][target] = visualizationState['FilterC'][target].filter(item => !element["ID"].includes(item))
      }

      if(unique && that.correctionMode){
        that.training.adaptActionList(that, visualizationState, "FilterC", "REMOVE", element)
      }
    })
  }





  /**
   * ChangeActiveFilter
   */

  changeActiveFilter(that: any, visualizationState: any, dataField: string, boundary: any, value: boolean, unique: boolean) {
    var visibility = visualizationState['FilterNActive'][dataField]

    if (value) {
      visibility[boundary] = true
    }
    else {
      visibility[boundary] = false

      if (boundary == 0) {
        visualizationState['FilterN'][dataField][boundary] = 0
      }
      else {
        visualizationState['FilterN'][dataField][boundary] = that.visCanvas.maxList[dataField][visualizationState['Aggregate'][dataField]]
      }

    }

    visualizationState['FilterNActive'][dataField] = visibility


  }

  /**
   * changeAxisHighlight
   */

  addAxisHighlight(that: any, visualizationState: any, target: any, unique: boolean) {
    Object.keys(visualizationState['CheckedHighlight']).forEach(element => {
      visualizationState['CheckedHighlight'][element] = false
    })


    document.getElementById("Axis-0").style.backgroundColor = ""
    document.getElementById("Axis-1").style.backgroundColor = ""

    if (visualizationState['Highlight'] == target || target == "ALL") {
      visualizationState['Highlight'] = ""
    }
    else {
      visualizationState['Highlight'] = target
      visualizationState['CheckedHighlight'][target] = true

      if (visualizationState["Values"].indexOf(target) == 0) {
        document.getElementById("Axis-1").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      else {
        document.getElementById("Axis-0").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
    }
    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Highlight", "ADD", [target])
    }
  }

  removeAxisHighlight(that: any, visualizationState: any, target: any, unique: boolean) {

    Object.keys(visualizationState['CheckedHighlight']).forEach(element => {
      visualizationState['CheckedHighlight'][element] = false
    })

    document.getElementById("Axis-0").style.backgroundColor = ""
    document.getElementById("Axis-1").style.backgroundColor = ""

    if (visualizationState['Highlight'] == target || target == "ALL") {
      visualizationState['Highlight'] = ""
    }
    else {
      if (visualizationState["Values"].indexOf(target) == 0) {
        visualizationState['Highlight'] = visualizationState["Values"][1]
        visualizationState['CheckedHighlight'][visualizationState["Values"][1]] = true
        document.getElementById("Axis-0").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      else {
        visualizationState['Highlight'] = visualizationState["Values"][0]
        visualizationState['CheckedHighlight'][visualizationState["Values"][0]] = true
        document.getElementById("Axis-1").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
    }

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "Highlight", "REMOVE", [target])
    }
  }

  addLegendHighlight(that: any, visualizationState: any, values: string[], unique: boolean) {

    var optionDictionary = that.optionDictionary

    if (typeof (that.optionDictionary) == 'undefined') {
      optionDictionary = that.visCanvas.optionDictionary
    }

    if (values.includes("ALL")) {
      var valuesFiltered: any = []
      optionDictionary[visualizationState['Color'][0]].forEach(item => {
        valuesFiltered.push(item["value"])
      })
      visualizationState['ColorHighlight'] = { [visualizationState['Color'][0]]: valuesFiltered }
    }
    else {
      if(visualizationState['Color'].length > 0){
        var valueFiltered: any = values.filter(item => {
          return optionDictionary[visualizationState['Color'][0]].some(element => element["value"] == item)
        })
      }
      else{
        var valueFiltered: any = []
      }
      
      



      if (Object.keys(visualizationState['ColorHighlight']).includes(visualizationState['Color'][0]) && valueFiltered.length > 0) {
        visualizationState['ColorHighlight'][visualizationState['Color'][0]] = visualizationState['ColorHighlight'][visualizationState['Color'][0]].concat(valueFiltered)
      }

      if (valueFiltered.length > 0) {
        visualizationState['ColorHighlight'] = { [visualizationState['Color'][0]]: valueFiltered }
      }
    }

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "ColorHighlight", "ADD", values)
    }

  }

  removeLegendHighlight(that: any, visualizationState: any, values: string[], unique: boolean) {
    var optionDictionary = that.optionDictionary

    if (typeof (that.optionDictionary) == 'undefined') {
      optionDictionary = that.visCanvas.optionDictionary
    }

    if (values.includes("ALL")) {
      visualizationState['ColorHighlight'] = {}
    }
    else if (Object.keys(visualizationState['ColorHighlight']).includes(visualizationState['Color'][0])) {
      visualizationState['ColorHighlight'][visualizationState['Color'][0]] = visualizationState['ColorHighlight'][visualizationState['Color'][0]].filter(item => !values.includes(item))
    }
    else {
      var valuesFiltered = []
      if(visualizationState['Color'].length > 0){
        optionDictionary[visualizationState['Color'][0]].forEach(item => {
          if (!values.includes(item["value"])) {
            valuesFiltered.push(item["value"])
          }
        })
        visualizationState['ColorHighlight'] = { [visualizationState['Color'][0]]: valuesFiltered }
      }
      
    }

    if(unique && that.correctionMode){
      that.training.adaptActionList(that, visualizationState, "ColorHighlight", "REMOVE", values)
    }
  }


}







