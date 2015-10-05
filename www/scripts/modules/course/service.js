'use strict';

angular
  .module('PresenteApp.Course.service', [])
  .service('courseService', ['$q', courseService]);

function courseService($q, CourseModel) {
  var db = new PouchDB('courses', {
    adapter: 'localstorage'
  });

  this.getAll = function() {
    var deferred = $q.defer();
    var options = {
      include_docs: true
    };

    db.allDocs(options, function(err, result) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve(result.rows);
    });

    return deferred.promise;
  };

  this.get = function(courseId) {
    var deferred = $q.defer();

    db.get(courseId, function(err, result) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve(result);
    });

    return deferred.promise;
  };

  this.getCourseClassesCountUntilNow = function(course) {
    return course.attendance.classes
      .filter(function(attendance) {
        var isPast = moment().diff(moment(attendance.date)) >= 0;
        if (isPast)
          return true;

        return false;
      }).length;
  };

  this.getAttendanceListByDate = function() {
    var deferred = $q.defer();

    db.allDocs({ include_docs: true }, function(err, result) {
      if (err) {
        deferred.reject(err);
        return;
      }

      var attendanceListByDate = {};
      result.rows.forEach(function(course) {
        return course.doc.attendance.classes
          .filter(function(attendance) {
            if (attendance.didAttend != null)
              return false;

            var isFuture = moment().diff(moment(attendance.date)) <= 0;
            if (isFuture)
              return false;

            return true;
          })
          .forEach(function(attendance) {

            attendanceListByDate[attendance.date] = attendanceListByDate[attendance.date] || [];

            attendanceListByDate[attendance.date].push({
              courseId: course.doc._id,
              courseName: course.doc.name,
            });
          });
        });

      deferred.resolve(attendanceListByDate);
    });

    return deferred.promise;
  };

  this.insert = function(course) {
    var deferred = $q.defer();

    var startDate = moment(course.start);
    var endDate = moment(course.end);
    var currentDate = startDate.clone();

    course.attendance = {
      total: 0,
      count: 0,
      classes: []
    };

    for (var currentDate = moment(course.start); currentDate.isBefore(endDate); currentDate.add(1, 'days')) {
      var classCount = course.classes[currentDate.day()] || 0;

      if (classCount > 0) {
        var attendance = {
          date: currentDate.clone(),
          didAttend: null
        }

        course.attendance.classes.push(attendance);
        course.attendance.total++;
      }
    }

    db.post(course, function(err, result) {
      if (err) {
        defered.reject(err);
        return;
      }

      deferred.resolve(result);
    });

    return deferred.promise;
  };

  this.remove = function(course) {
    var deferred = $q.defer();

    db.remove(course, function(err, result) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve(result);
    });

    return deferred.promise;
  };

  this.didAttend = function(courseId, date) {
    var deferred = $q.defer();

    db.get(courseId, function(err, course) {
      if (err) {
        deferred.reject(err);
        return;
      }

      var attendanceIndex;
      course.attendance.classes.every(function(attendance) {
        if (attendance.date == date) {
          attendance.didAttend = true;
          course.attendance.count++;
          return false;
        }

        return true;
      });

      db.put(course, courseId, function(err, updatedCourse) {
        if (err) {
          deferred.reject(err);
          return;
        }

        return deferred.resolve(updatedCourse);
      })
    });

    return deferred.promise;
  };

  this.didNotAttend = function(courseId, date) {
    var deferred = $q.defer();

    db.get(courseId, function(err, course) {
      if (err) {
        deferred.reject(err);
        return;
      }

      var attendanceIndex;
      course.attendance.classes.every(function(attendance) {
        if (attendance.date == date) {
          attendance.didAttend = false;
          return false;
        }

        return true;
      });

      db.put(course, courseId, function(err, updatedCourse) {
        if (err) {
          deferred.reject(err);
          return;
        }

        return deferred.resolve(updatedCourse);
      })
    });

    return deferred.promise;
  };
}