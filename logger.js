/**
 * @license Knockout-Logger-JS 1.0.0 Copyright (c) 2014, Cheng Fan.
 * Available via the MIT license.
 * see: http://github.com/onlyurei/knockout-logger-js for details
 */

define(['Storage', 'Knockout', 'Sugar'], function (Storage, ko) {

    var storageKeys = {
        enabled: 'logger',
        nativeConsoleEnabled: 'loggerNativeConsoleEnabled',
        logs: 'loggerLogs',
        timestamp: 'loggerTimestamp',
        persist: 'loggerPersist',
        reverse: 'loggerReverse',
        autoScroll: 'loggerAutoScroll',
        logFilter: 'loggerLogFilter',
        levelFilters: 'loggerLevelFilters',
        groupFilters: 'loggerGroupFilters'
    };

    if (Object.fromQueryString(window.location.search).logger == 'true') {
        Storage.set(storageKeys.enabled, true);
    } else if (Object.fromQueryString(window.location.search).logger == 'false') {
        Storage.remove(storageKeys.enabled);
    }
    if (Object.fromQueryString(window.location.search).console == 'true') {
        Storage.set(storageKeys.nativeConsoleEnabled, true);
    } else if (Object.fromQueryString(window.location.search).console == 'false') {
        Storage.remove(storageKeys.nativeConsoleEnabled);
    }

    var enabled = ko.observable(Storage.get(storageKeys.enabled)),
        nativeConsoleEnabled = ko.observable(Storage.get(storageKeys.nativeConsoleEnabled));

    var levels = {
        log: 'log',
        debug: 'debug',
        warn: 'warn',
        error: 'error'
    };

    var log = function (level, group, logFactory) {
        if (!Logger.enabled() && !Logger.nativeConsoleEnabled()) {
            return;
        }
        var _logFactory = Object.isFunction(logFactory) ? logFactory() : logFactory;
        var _log = {
            timestamp: Date.create().format(Date.ISO8601_DATETIME),
            level: level || levels.log,
            group: group || 'Unspecified',
            log: _logFactory
        };
        if (_log.log.compact()) {
            if (Logger.enabled()) {
                Logger.logs.push(_log);
                if (Logger.autoScroll()) {
                    var logger = document.getElementById(Logger.id);
                    if (logger) {
                        logger.scrollTop = logger.scrollHeight;
                    }
                }
            }
            if (nativeConsoleEnabled() && window.console) {
                window.console[level](_logFactory);
            }
        }
    };

    var Logger = {
        enabled: ko.computed({
            read: function () {
                return enabled();
            },
            write: function (value) {
                enabled(value);
                Storage.set(storageKeys.enabled, value);
            }
        }),
        nativeConsoleEnabled: ko.computed({
            read: function () {
                return nativeConsoleEnabled();
            },
            write: function (value) {
                nativeConsoleEnabled(value);
                Storage.set(storageKeys.nativeConsoleEnabled, value);
            }
        }),
        debug: function (group, logFactory) {
            log(levels.debug, group, logFactory);
        },
        log: function (group, logFactory) {
            log(levels.log, group, logFactory);
        },
        warn: function (group, logFactory) {
            log(levels.warn, group, logFactory);
        },
        error: function (group, logFactory) {
            log(levels.error, group, logFactory);
        }
    };

    if (Logger.enabled()) {

        var makeComputedObservable = function (observable, name) {
            Logger[name] = ko.computed({
                read: function () {
                    return observable();
                },
                write: function (value) {
                    observable(value);
                    Storage.set(storageKeys[name], value);
                }
            });
        };

        var timestamp = ko.observable(Storage.get(storageKeys.timestamp));
        var persist = ko.observable(Storage.get(storageKeys.persist));
        var reverse = ko.observable(Storage.get(storageKeys.reverse));
        var autoScroll = ko.observable(Storage.get(storageKeys.autoScroll));
        var logFilter = ko.observable(Storage.get(storageKeys.logFilter) || '');
        var levelFilters = ko.observable(Storage.get(storageKeys.levelFilters) || []);
        var groupFilters = ko.observable(Storage.get(storageKeys.groupFilters) || []);

        makeComputedObservable(timestamp, 'timestamp');
        makeComputedObservable(persist, 'persist');
        makeComputedObservable(autoScroll, 'autoScroll');
        makeComputedObservable(logFilter, 'logFilter');
        makeComputedObservable(levelFilters, 'levelFilters');
        makeComputedObservable(groupFilters, 'groupFilters');

        Logger.persist = ko.computed({
            read: function () {
                return persist();
            },
            write: function (value) {
                persist(value);
                if (!value) {
                    Logger.removePersistedLogs();
                }
                Storage.set(storageKeys.persist, value);
            }
        });

        Logger.reverse = ko.computed({
            read: function () {
                return reverse();
            },
            write: function (value) {
                reverse(value);
                Logger.autoScroll(false);
                if (value) {
                    var logger = document.getElementById(Logger.id);
                    if (logger) {
                        logger.scrollTop = 0;
                    }
                }
                Storage.set(storageKeys.reverse, value);
            }
        });

        Logger.id = 'logger-logs';

        Logger.logs = ko.observableArray(Storage.get(storageKeys.logs) || []);

        Logger.toggleFilter = function (observableFilters, filter) {
            var filters = observableFilters();
            if (filters.any(filter)) {
                filters.remove(filter);
            } else {
                filters.push(filter);
            }
            observableFilters(filters);
        };

        Logger.levels = ko.computed(function () {
            return Object.values(levels);
        });

        Logger.groups = ko.computed(function () {
            return Object.keys(Logger.logs().groupBy('group'));
        });

        Logger.filteredLogs = ko.computed(function () {
            var logFilter = Logger.logFilter().toLowerCase();
            var filteredLogs = Logger.logs().filter(function (i) {
                return (Logger.levelFilters().length ? Logger.levelFilters().any(i.level) : true) &&
                       (Logger.groupFilters().length ? Logger.groupFilters().any(i.group) : true) &&
                       (Logger.logFilter() ? (i.group.toLowerCase().has(logFilter) || i.log.toLowerCase().has(logFilter)) : true);
            });
            if (Logger.persist()) {
                Storage.set(storageKeys.logs, filteredLogs);
            }
            return Logger.reverse() ? filteredLogs.reverse() : filteredLogs;
        });

        Logger.removePersistedLogs = function () {
            Storage.remove(storageKeys.logs);
        };

        Logger.selectLogs = function () {
            if (document.selection) {
                var range = document.body.createTextRange();
                range.moveToElementText(document.getElementById(Logger.id));
                range.select();
            } else if (window.getSelection) {
                var range = document.createRange();
                range.selectNode(document.getElementById(Logger.id));
                window.getSelection().addRange(range);
            }
        };

    }

    return Logger;

});
