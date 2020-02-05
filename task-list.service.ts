import { Injectable, TemplateRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
@Injectable({
  providedIn: "root"
})
export class TaskListService {
  getWaitlistTaskScreenData() {
    throw new Error("Method not implemented.");
  }
  /* Variable declaration */

  baseURL = environment.taskURL;
  taskDetailUrl = environment.taskDetailUrl;

  newViewUrl: string;
  overdueViewUrl: string;
  allView: string;
  taskData: Observable<any>;
  waitTaskListScreenData: any;
  data: any;

  constructor(private httpClient: HttpClient) {}

  /*  Fetching task list depending on conditions */
  getTaskInfo(
    selectedType: string,
    selectedView: string,
    searchText?: string
  ): Observable<any> {
    let taskURL = this.baseURL;

    if (searchText) {
      this.newViewUrl =
        selectedType === "All"
          ? `${this.baseURL}?task.dueDays_lte=33 days&q=${searchText}`
          : `${this.baseURL}?task.dueDays_lte=33 days&q=${searchText}&task.type=${selectedType}`;
      this.overdueViewUrl =
        selectedType === "All"
          ? `${this.baseURL}?task.dueDays_gte=33 days&q=${searchText}`
          : `${this.baseURL}?task.dueDays_gte=33 days&q=${searchText}&task.type=${selectedType}`;
      this.allView =
        selectedType === "All"
          ? `${this.baseURL}?q=${searchText}`
          : `${this.baseURL}?q=${searchText}&task.type=${selectedType}`;
    } else {
      this.newViewUrl =
        selectedType === "All"
          ? `${this.baseURL}?task.dueDays_lte=33 days`
          : `${this.baseURL}?task.dueDays_lte=33 days&task.type=${selectedType}`;
      this.overdueViewUrl =
        selectedType === "All"
          ? `${this.baseURL}?task.dueDays_gte=33 days`
          : `${this.baseURL}?task.dueDays_gte=33 days&task.type=${selectedType}`;
      this.allView =
        selectedType === "All"
          ? `${this.baseURL}`
          : `${this.baseURL}?task.type=${selectedType}`;
    }

    /* This block will execute only selectedType != 'All' */
    if (
      selectedView === "New" ||
      "Overdue" ||
      ("All" && selectedType === "REFERRAL") ||
      "CUSTOM" ||
      "ORDER FOLLOW UP"
    ) {
      if (selectedView === "New") {
        taskURL = this.newViewUrl;
      }
      if (selectedView === "Overdue") {
        taskURL = this.overdueViewUrl;
      }
      if (selectedView === "All") {
        taskURL = this.allView;
      }
    }

    // This block will execute only selectedType='All'
    if (
      selectedView === "All" ||
      "New" ||
      ("Overdue" && selectedType === "All")
    ) {
      if (selectedView === "All" && selectedType === "All") {
        taskURL = this.allView;
      }
      if (selectedView === "New" && selectedType === "All") {
        taskURL = this.newViewUrl;
      }
      if (selectedView === "Overdue" && selectedType === "All") {
        taskURL = this.overdueViewUrl;
      }
    }

    return this.httpClient
      .get<any>(taskURL, { observe: "response" })
      .pipe(map(resp => (this.taskData = resp.body)));
  }

  getWaitTaskListScreen(): Observable<any> {
    return this.httpClient
      .get<any>(" http://localhost:3000/task", { observe: "response" })
      .pipe(map(resp => (this.waitTaskListScreenData = resp.body)));
  }

  getData(): Observable<any> {
    return this.httpClient
      .get<any>(this.taskDetailUrl)
      .pipe(map(resp => (this.data = resp)));
  }

  createTask(task: Object): Observable<Object> {
    return this.httpClient.post<any>(`${this.baseURL}`, task);
  }

/* THIS CODE FOR TOAST MESSAGES */
  toasts: any[] = [];
  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }
  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }


  getCommunicationHistory(): Observable<any> {
    return this.httpClient
      .get<any>("http://localhost:3000/communication")
      .pipe(map(resp => (this.data = resp)));
  }
}
