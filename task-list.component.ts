import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { SelectionType, ColumnMode } from "@swimlane/ngx-datatable";
import { Subject } from "rxjs";
import {
  switchMap,
  map,
  debounceTime,
  distinctUntilChanged
} from "rxjs/operators";
import { TaskListService } from "./task-list.service";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: "tm-task-list",
  templateUrl: "./task-list.component.html",
  styleUrls: ["./task-list.component.scss"]
})
export class TaskListComponent implements OnInit {
  /* Variable Declaration */
  SelectionType = SelectionType;
  ColumnMode = ColumnMode;
  selected = {};
  selectedType = "All";
  selectedView = "All";
  selectedStatus = false;
  activeRowId: number;
  selectedTaskId: number;
  searchText = "";
  viewTaskDetails = false;
  viewCommHistory = false;
  createTask = false;
  private searchTerms = new Subject<string>();
  rows;
  columns = [];

  /* Template References */
  @ViewChild("taskTemplate", { static: true }) public taskTemplate: TemplateRef<
    any
  >;
  @ViewChild("idTemplate", { static: true }) public idTemplate: TemplateRef<
    any
  >;
  @ViewChild("patientTemplate", { static: true })
  public patientTemplate: TemplateRef<any>;
  @ViewChild("providerTemplate", { static: true })
  public providerTemplate: TemplateRef<any>;
  @ViewChild("priorityTemplate", { static: true })
  public priorityTemplate: TemplateRef<any>;
  @ViewChild("assignedTemplate", { static: true })
  public assignedTemplate: TemplateRef<any>;
  @ViewChild("menuTemplate", { static: true }) public menuTemplate: TemplateRef<
    any
  >;
  @ViewChild("statusMarkerRef", { static: true })
  public statusMarkerRef: TemplateRef<any>;
  @ViewChild("sidebar", { static: true }) public sidebar: SidebarComponent;

  /* Arrays for dropdown selection like types, view ... */
  types = ["All", "REFERRAL", "CUSTOM", "ORDER FOLLOW UP"];
  views = ["All", "New", "Overdue"];
  menus = ["Modify", "Comm History", "Unassign"];
  filters = ["Type", "Id", "Date"];

  constructor(private taskListService: TaskListService) {}

  ngOnInit() {
    // Columns Definition
    this.columns = [
      { cellTemplate: this.statusMarkerRef, flexGrow: 0.2, sortable: false },
      { name: "ID", cellTemplate: this.idTemplate, flexGrow: 0.3 },
      {
        name: "Task",
        cellTemplate: this.taskTemplate,
        flexGrow: 1.5,
        sortable: false
      },
      { name: "Date", prop: "crt_ts_str", flexGrow: 0.5 },
      { name: "Patient", cellTemplate: this.patientTemplate, flexGrow: 0.6 },
      { name: "Provider", cellTemplate: this.providerTemplate, flexGrow: 0.6 },
      {
        name: "Priority",
        headerClass: "center-text",
        cellTemplate: this.priorityTemplate,
        flexGrow: 0.4
      },
      {
        name: "Assigned",
        headerClass: "center-text",
        prop: "assigned_to",
        cellTemplate: this.assignedTemplate,
        flexGrow: 0.4
      },
      { cellTemplate: this.menuTemplate, flexGrow: 0.7, sortable: false }
    ];

    // Fetching Task List
    /*  this.getTask(this.selectedType, this.selectedView, this.searchText); */

    this.getWaitTaskListScreenData();
  }

  // Method declaration for getting task list
  getTask(selectedType: string, selectedView: string) {
    this.taskListService
      .getTaskInfo(selectedType, selectedView)
      .subscribe(resp => (this.rows = resp));
    console.log(this.getTask);
  }

  // Method for Closing Sidebar
  onSidebarClose() {
    this.sidebar.closeSidebar();
    this.viewTaskDetails = false;
    this.viewCommHistory = false;
    this.createTask = false;
  }

  // Method for Sidebar toggle
  onToggle() {
    this.sidebar.onToggle();
  }

  // Method for getting Information of Selected Task
  onSelect(selectEvent) {
    this.selected = selectEvent;
    this.selectedTaskId = selectEvent.selected[0].id;
  }

  // View task details
  taskDetails() {
    this.viewTaskDetails = true;
    this.sidebar.openSidebar();
  }

  // View communication history
  viewCommunicationHistory() {
    this.viewCommHistory = true;
    this.sidebar.openSidebar();
  }

  // View create new task
  createNewTask(event) {
    this.createTask = true;
    this.sidebar.openSidebar();
  }

  // Method to filter the Task by View like New, Overdue ...
  filterByView(view: string) {
    this.selectedView = view;
    this.getTask(this.selectedType, this.selectedView);
  }

  // Method for filter the Task by type like REFERRAL, CUSTOM ...
  filterByType(type: string) {
    this.selectedType = type;
    this.getTask(this.selectedType, this.selectedView);
  }

  //  Method for searching task
  searchTask(event) {
    const val = event.target.value.toLowerCase();
    this.searchTerms.next(val);
    this.searchTerms
      .pipe(
        map(term => (this.searchText = term)),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(() =>
          this.taskListService
            .getTaskInfo(this.selectedType, this.selectedView, this.searchText)
            .pipe(
              map(resp => {
                this.rows = resp;
              })
            )
        )
      )
      .subscribe();
  }

  // Method for getting data from tasklist
  getWaitTaskListScreenData() {
    this.taskListService.getWaitTaskListScreen().subscribe(resp => {
      this.rows = resp;
      console.log(this.rows);
    });
  }

  // Method for row menu selection
  onMenuSelect() {}

  // Method for showing task status marker depending on Task Id
  onActivate(event) {
    this.activeRowId = event.row.id;
  }
}