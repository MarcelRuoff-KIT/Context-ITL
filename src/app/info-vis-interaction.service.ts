import { Injectable } from '@angular/core';
import { key } from 'vega';
import { forEach } from 'vega-lite/build/src/encoding';

@Injectable()
export class InfoVisInteractionService {

  constructor() { }


  async processAction(that, visualizationState, action, unique, ambiguity) {

    var keys = Object.keys(action)
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] == "VISUALIZATION") {
        if (action["VISUALIZATION"]["ADD"].length > 0) {
          await this.changeVisualization(that, visualizationState, action["VISUALIZATION"]["ADD"][0], unique, ambiguity)
        }
      }
      else if (keys[i] == "Aggregate") {
        for (var element in action["Aggregate"]["ADD"]) {
          if (action["Aggregate"]["ADD"][element]["KEY"] == "ALL") {
            for (var index in visualizationState["Values"]) {
              await this.changeAggregate(that, visualizationState, visualizationState["Values"][index], action["Aggregate"]["ADD"][element]["ID"], false, ambiguity)
            }
            if((unique && that.overallMode == 0) || (that.overallMode == 2)){

              await that.training.adaptActionList(that, visualizationState, "x-Axis", "ADD", [{"KEY": "ALL", "ID": action["Aggregate"]["ADD"][element]["ID"]}], ambiguity)
            }
          }
          else {
            await this.changeAggregate(that, visualizationState, action["Aggregate"]["ADD"][element]["KEY"], action["Aggregate"]["ADD"][element]["ID"], unique, ambiguity)
          }
        }

      }
      else if (keys[i] == "x-Axis") {
        if (action["x-Axis"]["REMOVE"].includes("ALL")) {
          await this.removeXAxis(that, visualizationState, action["x-Axis"]["REMOVE"], unique, ambiguity)
        }
        if (!action["x-Axis"]["ADD"].includes("ALL") && action["x-Axis"]["ADD"].length > 0) {
          await this.addXAxis(that, visualizationState, action["x-Axis"]["ADD"], unique, ambiguity)
        }
        if (!action["x-Axis"]["REMOVE"].includes("ALL") && action["x-Axis"]["REMOVE"].length > 0) {
          await this.removeXAxis(that, visualizationState, action["x-Axis"]["REMOVE"], unique, ambiguity)
        }
      }
      else if (keys[i] == "Values") {
        if (action["Values"]["REMOVE"].includes("ALL")) {
          await this.removeValues(that, visualizationState, action["Values"]["REMOVE"], unique, ambiguity)
        }
        if (!action["Values"]["ADD"].includes("ALL") && action["Values"]["ADD"].length > 0) {
          await this.addValues(that, visualizationState, action["Values"]["ADD"], unique, ambiguity)
        }
        if (!action["Values"]["REMOVE"].includes("ALL") && action["Values"]["REMOVE"].length > 0) {
          await this.removeValues(that, visualizationState, action["Values"]["REMOVE"], unique, ambiguity)
        }
      }
      else if (keys[i] == "Color") {
        if (action["Color"]["REMOVE"].includes("ALL")) {
          await this.removeLegends(that, visualizationState, action["Color"]["REMOVE"], unique, ambiguity)
        }
        if (!action["Color"]["ADD"].includes("ALL") && action["Color"]["ADD"].length > 0) {
          await this.addLegends(that, visualizationState, action["Color"]["ADD"], unique, ambiguity)
        }
        if (!action["Color"]["REMOVE"].includes("ALL") && action["Color"]["REMOVE"].length > 0) {
          await this.removeLegends(that, visualizationState, action["Color"]["REMOVE"], unique, ambiguity)
        }
      }
      else if (keys[i] == "Highlight") {
        if (action["Highlight"]["ADD"].includes("ALL")) {
          await this.addAxisHighlight(that, visualizationState, action["Highlight"]["ADD"], unique, ambiguity)
        }
        if (action["Highlight"]["REMOVE"].includes("ALL")) {
          await this.removeAxisHighlight(that, visualizationState, action["Highlight"]["REMOVE"], unique, ambiguity)
        }
        if (!action["Highlight"]["ADD"].includes("ALL") && action["Highlight"]["ADD"].length > 0) {
          await this.addAxisHighlight(that, visualizationState, action["Highlight"]["ADD"], unique, ambiguity)
        }
        if (!action["Highlight"]["REMOVE"].includes("ALL") && action["Highlight"]["REMOVE"].length > 0) {
          await this.removeAxisHighlight(that, visualizationState, action["Highlight"]["REMOVE"], unique, ambiguity)
        }
      }
      else if (keys[i] == "ColorHighlight") {
        if (action["ColorHighlight"]["ADD"].includes("ALL")) {
          await this.addLegendHighlight(that, visualizationState, action["ColorHighlight"]["ADD"], unique, ambiguity)
        }
        if (action["ColorHighlight"]["REMOVE"].includes("ALL")) {
          await this.removeLegendHighlight(that, visualizationState, action["ColorHighlight"]["REMOVE"], unique, ambiguity)
        }
        if (!action["ColorHighlight"]["ADD"].includes("ALL") && action["ColorHighlight"]["ADD"].length > 0) {
          await this.addLegendHighlight(that, visualizationState, action["ColorHighlight"]["ADD"], unique, ambiguity)
        }
        if (!action["ColorHighlight"]["REMOVE"].includes("ALL") && action["ColorHighlight"]["REMOVE"].length > 0) {
          await this.removeLegendHighlight(that, visualizationState, action["ColorHighlight"]["REMOVE"], unique, ambiguity)
        }
      }
      else if (keys[i] == "Filter") {
        if (action["Filter"]["ADD"].includes("ALL")) {
          await this.openingFilters(that, visualizationState, action["Filter"]["ADD"], unique, ambiguity)
        }
        if (action["Filter"]["REMOVE"].includes("ALL")) {
          await this.removeFilters(that, visualizationState, action["Filter"]["REMOVE"], unique, ambiguity)
        }
        if (!action["Filter"]["ADD"].includes("ALL") && action["Filter"]["ADD"].length > 0) {
          await this.openingFilters(that, visualizationState, action["Filter"]["ADD"], unique, ambiguity)
        }
        if (!action["Filter"]["REMOVE"].includes("ALL") && action["Filter"]["REMOVE"].length > 0) {
          await this.removeFilters(that, visualizationState, action["Filter"]["REMOVE"], unique, ambiguity)
        }
      }
      else if (keys[i] == "FilterN") {
        await this.changeNumFilter(that, visualizationState, action["FilterN"]["ADD"], "ADD", unique, ambiguity)
        await this.changeNumFilter(that, visualizationState, action["FilterN"]["REMOVE"], "REMOVE", unique, ambiguity)
      }
      else if (keys[i] == "FilterC") {
        await this.addCatFilter(that, visualizationState, action["FilterC"]["ADD"].filter(element => element["ID"].includes("ALL")), unique, ambiguity)
        await this.removeCatFilter(that, visualizationState, action["FilterC"]["REMOVE"].filter(element => element["ID"].includes("ALL")), unique, ambiguity)
        await this.addCatFilter(that, visualizationState, action["FilterC"]["ADD"].filter(element => !element["ID"].includes("ALL")), unique, ambiguity)
        await this.removeCatFilter(that, visualizationState, action["FilterC"]["REMOVE"].filter(element => !element["ID"].includes("ALL")), unique, ambiguity)
      }
    }

  }


  /**
 * Encodings
 */


  /**
   * Change Visualization
   */
  async changeVisualization(that: any, visualizationState: any, target: string, unique: boolean, ambiguity: any) {
    
    visualizationState["VISUALIZATION"] = target;

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "VISUALIZATION", "ADD", target, ambiguity)
    }
  }


  

  /**
   * Change Aggregate
   */

   async changeAggregate(that: any, visualizationState: any, dataField: string, aggregate: string, unique: boolean, ambiguity: any) {



    visualizationState['Aggregate'][dataField] = aggregate


    for (var i = 0; i < Object.keys(that.visCanvas.maxList[dataField]).length; i++) {
      if (that.visCanvas.maxList[dataField][Object.keys(that.visCanvas.maxList[dataField])[i]] == visualizationState['FilterN'][dataField][1]) {
        visualizationState['FilterN'][dataField][1] = that.visCanvas.maxList[dataField][aggregate]
        break;
      }
    }

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Aggregate", "ADD", [{"KEY": dataField, "ID": aggregate}], ambiguity)
    }
  }

  /**
   * Change x-Axis
   */

  async addXAxis(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {


    //remove previous xAxis
    await this.removeXAxis(that, visualizationState, visualizationState['x-Axis'], false, ambiguity)

    for(var i = 0; i < dataFields.length; i++){
      if (visualizationState["Values"].includes(dataFields[i])) {
        this.removeValues(that, visualizationState, [dataFields[i]], false, ambiguity)
      }
      else if (visualizationState['Color'].includes(dataFields[i])) {
        this.removeLegends(that, visualizationState, [dataFields[i]], false, ambiguity)

      }
    }

    if (dataFields.length > 0) {
      visualizationState['x-Axis'] = [dataFields[0]]

      visualizationState['Datafields'].push(dataFields[0])
      visualizationState['Datafields'] = JSON.parse(JSON.stringify(visualizationState['Datafields'].filter((v, i, a) => a.indexOf(v) === i)))
    }


    if((unique && that.overallMode == 0) || (that.overallMode == 2)){
      await that.training.adaptActionList(that, visualizationState, "x-Axis", "ADD", dataFields, ambiguity)
    }

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => visualizationState["x-Axis"].includes(datafield) || visualizationState["Color"].includes(datafield) || visualizationState["Values"].includes(datafield))
  }

  async removeXAxis(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {

    var currentDatafields = []

    if(dataFields.includes('ALL')){
      currentDatafields = visualizationState['x-Axis']
    }
    else{
      currentDatafields = currentDatafields.concat(dataFields)
    }


    var mediateFields = JSON.parse(JSON.stringify(visualizationState['x-Axis']))
    visualizationState['x-Axis'] = mediateFields.filter((datafield: any) => !currentDatafields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => !currentDatafields.includes(datafield))


    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "x-Axis", "REMOVE", dataFields, ambiguity)
    }
  }

  /**
   * Change Values
   */

   async addValues(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {
    
    var nonNumeric = false
    for(var i = 0; i < dataFields.length; i++){
      if (that.visCanvas.dataFieldsConfig[dataFields[i]] == "quantitative") {
        if (visualizationState['x-Axis'].includes(dataFields[i])) {
          this.removeXAxis(that, visualizationState, [dataFields[i]], false, ambiguity)

        }
        else if (visualizationState['Values'].includes(dataFields[i])) {
          this.removeValues(that, visualizationState, [dataFields[i]], false, ambiguity)
        }
        else if (visualizationState['Color'].includes(dataFields[i])) {
          this.removeLegends(that, visualizationState, [dataFields[i]], false, ambiguity)

        }
      }
    }

    for (var i = 0; i < dataFields.length; i++) {
      if (that.visCanvas.dataFieldsConfig[dataFields[i]] == "quantitative") {
        if (visualizationState["Values"].length >= 2) {
          this.removeValues(that, visualizationState, [visualizationState["Values"][0]], false, ambiguity)
        }

        visualizationState["Values"].push(dataFields[i])
        visualizationState["Values"] = JSON.parse(JSON.stringify(visualizationState["Values"].filter((v, i, a) => a.indexOf(v) === i)))
        visualizationState['Datafields'].push(dataFields[i])
        visualizationState['Datafields'] = JSON.parse(JSON.stringify(visualizationState['Datafields'].filter((v, i, a) => a.indexOf(v) === i)))
      }
      else {
        nonNumeric = true
      }
    }

    if (nonNumeric) {
      that.showErrorMessage()
    }


    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Values", "ADD", dataFields, ambiguity)
    }

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => visualizationState["x-Axis"].includes(datafield) || visualizationState["Color"].includes(datafield) || visualizationState["Values"].includes(datafield))
  }

  async removeValues(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {

    var currentDatafields = []

    Object.keys(visualizationState['CheckedHighlight']).forEach(element => {
      visualizationState['CheckedHighlight'][element] = false
    })
    visualizationState['Highlight'] = ""

    if(dataFields.includes('ALL')){
      currentDatafields = visualizationState['Values']
    }
    else{
      currentDatafields = currentDatafields.concat(dataFields)
    }
    

    var mediateFields = JSON.parse(JSON.stringify(visualizationState["Values"]))
    visualizationState["Values"] = mediateFields.filter((datafield: any) => !currentDatafields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => !currentDatafields.includes(datafield))

    visualizationState['Highlight'] = ""


    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Values", "REMOVE", dataFields, ambiguity)
    }
  }

  /**
   * Change Legend
   */

   async addLegends(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {

    
    for(var i = 0; i < dataFields.length; i++){
      if (visualizationState['x-Axis'].includes(dataFields[i])) {
        this.removeXAxis(that, visualizationState, [dataFields[i]], false, ambiguity)

      }
      else if (visualizationState["Values"].includes(dataFields[i])) {
        this.removeValues(that, visualizationState, [dataFields[i]], false, ambiguity)

      }
    }


    if (dataFields.length > 0) {
      visualizationState['Color'] = [dataFields[0]]

      if (!visualizationState['Datafields'].includes(dataFields[0])) {
        visualizationState['Datafields'].push(dataFields[0])

        visualizationState['ColorHighlight'] = visualizationState['ColorHighlight'].filter(element => that.visCanvas.optionDictionary[visualizationState['Color'][0]].some(entity => entity['label'] == element))

      }
      visualizationState['Datafields'] = JSON.parse(JSON.stringify(visualizationState['Datafields'].filter((v, i, a) => a.indexOf(v) === i)))

    }


    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Color", "ADD", dataFields, ambiguity)
    }

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => visualizationState["x-Axis"].includes(datafield) || visualizationState["Color"].includes(datafield) || visualizationState["Values"].includes(datafield))

  }

  async removeLegends(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {

    var currentDatafields = []

    if(dataFields.includes('ALL')){
      currentDatafields = visualizationState['Color']
    }
    else{
      currentDatafields = currentDatafields.concat(dataFields)
    }

   if(currentDatafields.length > 0){
    var mediateFields = JSON.parse(JSON.stringify(visualizationState['Color']))
    visualizationState['Color'] = mediateFields.filter((datafield: any) => !currentDatafields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(visualizationState['Datafields']))
    visualizationState['Datafields'] = mediateAllFields.filter((datafield: any) => !currentDatafields.includes(datafield))

    visualizationState['ColorHighlight'] = []


    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Color", "REMOVE", dataFields, ambiguity)
    }
   }

    
  }




  /**
   * Change Filter
   */

   async removeFilters(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {
    var currentDatafields = []

    if(dataFields.includes('ALL')){
      currentDatafields = visualizationState['Filter']
    }
    else{
      currentDatafields = currentDatafields.concat(dataFields)
    }

    currentDatafields.forEach(element => {
      visualizationState['Filter'] = visualizationState['Filter'].filter(filter => filter != element)

      if (that.visCanvas.dataFieldsConfig[element] == "quantitative") {
        visualizationState['FilterN'][element][1] = that.visCanvas.maxList[element][visualizationState['Aggregate'][element]]
      }
      else {
        visualizationState['FilterC'][element] = []
        that.visCanvas.optionDictionary[element].forEach((item: { [x: string]: any; }) => visualizationState['FilterC'][element].push(item["value"]))
      }
    })

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Filter", "REMOVE", dataFields, ambiguity)
    }
  }

  async openingFilters(that: any, visualizationState: any, dataFields: string[], unique: boolean, ambiguity: any) {
    if (dataFields.includes("ALL")) {
      dataFields = that.visCanvas.dataFields
    }

    dataFields.forEach(element => {
      visualizationState['Filter'].unshift(element)
      visualizationState['Filter']= [...new Set(visualizationState['Filter'])];
    })

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Filter", "ADD", dataFields, ambiguity)
    }
  }

  async changeNumFilter(that: any, visualizationState: any, filters: any[], verb: string, unique: boolean, ambiguity: any) {
    filters.forEach(element => {
      var target = element["Filter"]

      if(!visualizationState["Filter"].includes(target)){
        this.openingFilters(that, visualizationState, [target], false, ambiguity)
      }
      var range = visualizationState['FilterN'][target]

      if(verb == "ADD"){
        if (typeof (element["GT"]) != "undefined" && typeof (element["LT"]) != "undefined") {
          this.changeActiveFilter(that, visualizationState, target, 0, true, false, ambiguity)
          this.changeActiveFilter(that, visualizationState, target, 1, true, false, ambiguity)

          range = [parseInt(element["GT"]) , parseInt(element["LT"]) ]
        }
        else if(typeof (element["GT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 0, true, false, ambiguity)
          range = [parseInt(element["GT"]), that.visCanvas.maxList[target][visualizationState['Aggregate'][target]]]

        }
        else if(typeof (element["LT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 1, true, false, ambiguity)
          range = [0 , parseInt(element["LT"])]
        }
      }
      else if(verb == "REMOVE"){
        if (typeof (element["GT"]) != "undefined" && typeof (element["LT"]) != "undefined") {
          this.changeActiveFilter(that, visualizationState, target, 0, true, false, ambiguity)
          this.changeActiveFilter(that, visualizationState, target, 1, true, false, ambiguity)

          range = [parseInt(element["LT"]), parseInt(element["GT"])]
        }
        else if(typeof (element["GT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 1, true, false, ambiguity)
          range[1] = parseInt(element["GT"])

        }
        else if(typeof (element["LT"]) != "undefined"){
          this.changeActiveFilter(that, visualizationState, target, 0, true, false, ambiguity)
          range[0] = parseInt(element["LT"])
        }
      }

      visualizationState['FilterN'][target] = range

      if((unique && that.overallMode == 0) || (that.overallMode == 2)){

        that.training.adaptActionList(that, visualizationState, "FilterN", verb, element, ambiguity)
      }
    })
  }

  async addCatFilter(that: any, visualizationState: any, filters: any[], unique: boolean, ambiguity: any) {
    filters.forEach(element => {
      var target = element["KEY"]
      this.openingFilters(that, visualizationState, [target], false, ambiguity)

      if (element["ID"].includes("ALL")) {
        that.visCanvas.optionDictionary[target].forEach(item => visualizationState['FilterC'][target].push(item["value"]))
        visualizationState['FilterC'][target] = [...new Set(visualizationState['FilterC'][target])];
      }
      else {
        visualizationState['FilterC'][target] = visualizationState['FilterC'][target].concat(element["ID"])
      }

      if((unique && that.overallMode == 0) || (that.overallMode == 2)){

        that.training.adaptActionList(that, visualizationState, "FilterC", "ADD", element, ambiguity)
      }

    })
  }


  async removeCatFilter(that: any, visualizationState: any, filters: any[], unique: boolean, ambiguity: any) {
    filters.forEach(element => {
      var target = element["KEY"]

      this.openingFilters(that, visualizationState, [target], false, ambiguity)

      if (element["ID"].includes("ALL")) {
        visualizationState['FilterC'][target] = []
      }
      else {
        visualizationState['FilterC'][target] = visualizationState['FilterC'][target].filter(item => !element["ID"].includes(item))
      }

      if((unique && that.overallMode == 0) || (that.overallMode == 2)){

        that.training.adaptActionList(that, visualizationState, "FilterC", "REMOVE", element, ambiguity)
      }
    })
  }





  /**
   * ChangeActiveFilter
   */

   async changeActiveFilter(that: any, visualizationState: any, dataField: string, boundary: any, value: boolean, unique: boolean, ambiguity: any) {
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

   async addAxisHighlight(that: any, visualizationState: any, target: any, unique: boolean, ambiguity: any) {
    Object.keys(visualizationState['CheckedHighlight']).forEach(element => {
      visualizationState['CheckedHighlight'][element] = false
    })

    if (target instanceof Array && target.length > 0){
      target = target[0]
    }
    else if(target instanceof Array){
      target = ""
    }

/*
    document.getElementById("Canvas_Axis-0").style.backgroundColor = ""
    document.getElementById("Canvas_Axis-1").style.backgroundColor = ""
    */

    if (visualizationState['Highlight'] == target || target == "ALL") {
      visualizationState['Highlight'] = ""
    }
    else {
      visualizationState['Highlight'] = target
      visualizationState['CheckedHighlight'][target] = true
/*
      if (visualizationState["Values"].indexOf(target) == 0) {
        document.getElementById("Canvas_Axis-1").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      else {
        document.getElementById("Canvas_Axis-0").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      */
    }
    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Highlight", "ADD", [target], ambiguity)
    }
  }

  async removeAxisHighlight(that: any, visualizationState: any, target: any, unique: boolean, ambiguity: any) {

    Object.keys(visualizationState['CheckedHighlight']).forEach(element => {
      visualizationState['CheckedHighlight'][element] = false
    })

    if (target instanceof Array && target.length > 0){
      target = target[0]
    }
    else if(target instanceof Array){
      target = ""
    }

    //document.getElementById("Canvas_Axis-0").style.backgroundColor = ""
    //document.getElementById("Canvas_Axis-1").style.backgroundColor = ""

    if (visualizationState['Highlight'] == target || target == "ALL") {
      visualizationState['Highlight'] = ""
    }
    else {
      if (visualizationState["Values"].indexOf(target) == 0) {
        visualizationState['Highlight'] = visualizationState["Values"][1]
        visualizationState['CheckedHighlight'][visualizationState["Values"][1]] = true
        //document.getElementById("Canvas_Axis-0").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      else {
        visualizationState['Highlight'] = visualizationState["Values"][0]
        visualizationState['CheckedHighlight'][visualizationState["Values"][0]] = true
        //document.getElementById("Canvas_Axis-1").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
    }

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "Highlight", "REMOVE", [target], ambiguity)
    }
  }

  async addLegendHighlight(that: any, visualizationState: any, values: string[], unique: boolean, ambiguity: any) {

    var optionDictionary = that.optionDictionary

    if (typeof (that.optionDictionary) == 'undefined') {
      optionDictionary = that.visCanvas.optionDictionary
    }

    if (values.includes("ALL")) {
      visualizationState['ColorHighlight'] = []
    }
    else {
/*      if(visualizationState['Color'].length > 0){
        valueFiltered
        var valueFiltered: any = values.filter(item => {
          return optionDictionary[visualizationState['Color'][0]].some(element => element["value"] == item)
        })
      }
      else{
        var valueFiltered: any = []
      }
      */
      
      visualizationState['ColorHighlight'] = visualizationState['ColorHighlight'].concat(values)

      visualizationState['ColorHighlight'] = [...new Set(visualizationState['ColorHighlight'])]

    }

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){

      await that.training.adaptActionList(that, visualizationState, "ColorHighlight", "ADD", values, ambiguity)
    }

  }

  async removeLegendHighlight(that: any, visualizationState: any, values: string[], unique: boolean, ambiguity: any) {
    var optionDictionary = that.optionDictionary

    if (typeof (that.optionDictionary) == 'undefined') {
      optionDictionary = that.visCanvas.optionDictionary
    }

    if (values.includes("ALL")) {
      visualizationState['ColorHighlight'] = []
    }
    else if (values.some(element => visualizationState['ColorHighlight'].includes(element))){
      visualizationState['ColorHighlight'] = visualizationState['ColorHighlight'].filter(item => !values.includes(item))
    }
    else if(values.length > 0) {
      var valuesFiltered = []
      Object.keys(optionDictionary).forEach(key => { 
        if(optionDictionary[key].some(element => values.includes(element["label"]))){
          optionDictionary[key].forEach(item => {
            if(!values.includes(item["label"])){
              valuesFiltered.push(item["label"])
            }
          })
          
        }
      })

      visualizationState['ColorHighlight'] = valuesFiltered
      
    }

    if((unique && that.overallMode == 0) || (that.overallMode == 2)){
      await that.training.adaptActionList(that, visualizationState, "ColorHighlight", "REMOVE", values, ambiguity)
    }
  }


}







