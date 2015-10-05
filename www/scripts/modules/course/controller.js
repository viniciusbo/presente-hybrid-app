'use strict';

angular.module('PresenteApp.Course.controller', ['PresenteApp.Course.service'])
  .controller('CoursesMainCtrl', CoursesMainCtrl)
  .controller('CoursesNewCtrl', CoursesNewCtrl)
  .controller('CoursesShowCtrl', CoursesShowCtrl);

function CoursesMainCtrl($scope, $state, $ionicSideMenuDelegate, courseService) {
  var displayCourses = function() {
    courseService
      .getAll()
      .then(function(courses) {
        $scope.courses = courses;
      }, function(err) {
        console.error(err);
      });
  };

  var displayAttendanceList = function() {
    courseService
      .getAttendanceListByDate()
      .then(function(attendanceListByDate) {
        $scope.attendanceListByDate = attendanceListByDate;
      }, function(err) {
        console.error(err);
      });
  };

  displayCourses();
  displayAttendanceList();

  $scope.getCourseClassesCountUntilNow = function(course) {
    return courseService.getCourseClassesCountUntilNow(course);
  };

  $scope.remove = function(course) {
    courseService
      .remove(course)
      .then(function(result) {
        displayCourses();
        displayAttendanceList();
      }, function(err) {
        console.error(err);
      });
  };

  $scope.didAttend = function(courseId, date) {
    courseService
      .didAttend(courseId, date)
      .then(function(result) {
         $ionicSideMenuDelegate.toggleRight();
         displayCourses();
         displayAttendanceList();
      }, function(err) {
        console.error(err);
      });
  };

  $scope.didNotAttend = function(courseId, date) {
    courseService
      .didNotAttend(courseId, date)
      .then(function(result) {
        $ionicSideMenuDelegate.toggleRight();
        displayCourses();
        displayAttendanceList();
      }, function(err) {
        console.error(err);
      });
  };
}

function CoursesNewCtrl($scope, $state, courseService) {
  $scope.course = {};

  $scope.hasAtLeastOneClass = function(weekdays, courseClasses) {
    var classes = courseClasses || {};
    var isValid = false;

    if (weekdays && typeof weekdays == 'object') {
      Object
        .keys(weekdays)
        .forEach(function(weekday) {
          if (weekdays[weekday] == true && classes[weekday] > 0) {
            isValid = true;
          }
        });
    }

    return isValid;
  };

  $scope.save = function(course) {
    courseService
      .insert(course)
      .then(function(result) {
        $state.go('main');
      }, function(err) {
        console.error(err);
      });
  };
}

function CoursesShowCtrl($scope, $stateParams, courseService) {
  courseService
    .get($stateParams.courseId)
    .then(function(result) {
      $scope.course = result;
    }, function(err) {
      console.error(err);
    })
}