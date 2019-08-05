import {HttpClient} from '@angular/common/http';
import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {merge, Observable, of as observableOf, Subject} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import xml2js from 'xml2js';
import { log } from 'util';


/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'table-http-example',
  styleUrls: ['table-http-example.css'],
  templateUrl: 'table-http-example.html',
})
export class TableHttpExample implements AfterViewInit {
  displayedColumns: string[] = [ 'state', 'number', 'title'];
  exampleDatabase: ExampleHttpDatabase | null;
  data: Object[] = [];
  dataSource = new MatTableDataSource(this.data);

  resultsLength = 0;
  isLoadingResults = true;
  searchString: string = 'Game';
  inputChange =new Subject();

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(private _httpClient: HttpClient) {}

  ngAfterViewInit() {
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.updateRows();
  }
  
  applyFilter(filterValue: string) {    
    this.searchString = filterValue.trim();
    this.inputChange.next(filterValue.trim());
    this.paginator.pageIndex = 0;
  }

  updateRows() {
    merge(this.inputChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getBooks(
            this.searchString, this.paginator.pageIndex);
        }),
        map((data:any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.search['total-results'];

          let books = data.search.results.work;
          books = books.map(b => ({
            title: b.best_book.title,
            state: b.best_book.author.name,
            // created: parseInt(b.original_publication_year._),
            // created: new Date(),
            number: parseInt(b.id._)
          }));

          return books;

          // return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  getBooks(searchString:string, page: number): Observable<any> {
    const href = 'http://localhost:3000/books';
    const requestUrl =
        `${href}?q=${searchString}&page=${page + 1}`;
    return this._httpClient.get(requestUrl);
  }
}


/**  Copyright 2019 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */