// src/core/mappings/interestsMappings.js
import { serviceLocator } from "../../core/services/BaseService";
import { INTERESTS_ACTIONS } from "../../core/constants/actions";
import { INTERESTS_EVENTS } from "../../core/constants/events";


export const setupInterestsMappings = (eventBridgeService) => {

  const eventActionBridgeService = eventBridgeService || 
  serviceLocator.get('eventActionBridge');

  eventActionBridgeService.registerMappings([
  {
    serviceName: 'interests',
    eventType: INTERESTS_EVENTS.FETCH_CATEGORIES_SUCCESS,
    actionType: INTERESTS_ACTIONS.FETCH_CATEGORIES_SUCCESS,
    transformer: (eventData) => ({
      availableInterests: eventData.categories,
    })
  },
  {
    serviceName: 'interests',
    eventType: INTERESTS_EVENTS.USER_INTERESTS_UPDATED,
    actionType: INTERESTS_ACTIONS.FETCH_USER_INTERESTS_SUCCESS,
    transformer: (eventData) => ({ interests: eventData.interests })
  },
  {
    serviceName: 'interests',
    eventType: INTERESTS_EVENTS.CATEGORIES_UPDATED,
    actionType: INTERESTS_ACTIONS.SET_AVAILABLE_INTERESTS,
    transformer: (eventData) => eventData.categories
  },
  {
    serviceName: 'interests',
    eventType: INTERESTS_EVENTS.INTERESTS_UPDATE_ERROR,
    actionType: INTERESTS_ACTIONS.UPDATE_INTERESTS_FAILURE,
    transformer: (eventData) => eventData.error
  }
])
};