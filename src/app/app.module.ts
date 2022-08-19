import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainViewComponent } from './main-view/main-view.component';
import { VisualizationCanvasComponent } from './visualization-canvas/visualization-canvas.component';
import { InfoVisInteractionService } from './info-vis-interaction.service';
import { TrainingService } from './training.service';
import { NLGeneration } from './NLGeneration.service';


//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { DividerModule } from "primeng/divider";
import {ToolbarModule} from 'primeng/toolbar';
import{ButtonModule} from 'primeng/button';
import {DragDropModule} from 'primeng/dragdrop';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {ListboxModule} from 'primeng/listbox';
import {SplitterModule} from 'primeng/splitter';
import { ChipModule } from 'primeng/chip';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {AccordionModule} from 'primeng/accordion';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {InputNumberModule} from 'primeng/inputnumber';
import {FieldsetModule} from 'primeng/fieldset';
import {CardModule} from 'primeng/card';
import {CarouselModule} from 'primeng/carousel';
import {BadgeModule} from 'primeng/badge';
import {StepsModule} from 'primeng/steps';
import {TooltipModule} from 'primeng/tooltip';
import {DialogModule} from 'primeng/dialog';






import { NgxCsvParserModule } from 'ngx-csv-parser';



@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    VisualizationCanvasComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    DividerModule,
    ToolbarModule,
    ButtonModule,
    DragDropModule,
    ToggleButtonModule,
    ListboxModule,
    SplitterModule,
    ChipModule,
    AutoCompleteModule,
    AccordionModule,
    MultiSelectModule,
    DropdownModule,
    InputNumberModule,
    FieldsetModule,
    CardModule,
    CarouselModule,
    BadgeModule,
    StepsModule,
    TooltipModule,
    DialogModule,

    NgxCsvParserModule
  ],
  providers: [InfoVisInteractionService, TrainingService, NLGeneration],
  bootstrap: [AppComponent]
})
export class AppModule { }
