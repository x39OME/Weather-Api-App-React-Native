// import axios from 'axios';

import axios from 'axios';
import { apiKey } from '../constants';

// const forecastEndpoint = params=>`https://api.weatherapi.com/v1/forecast.json?key=a7e5761fe40842728a8144159241802&q=Jeddah&days=1&aqi=no&alerts=no`
const forecastEndpoint = params=>`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const locationsEndpoint = params=>`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;


const apiCall = async (endpoint)=>{
  const options = {
    method: 'GET',
    url : endpoint
  }
  try{
    const response = await axios.request(options);
    return response.data;
  }catch(err){
    console.log('error:' ,err);
    return null;
  }
}

export const fetchweatherForecast = params=>{
  return apiCall(forecastEndpoint(params));
}

export const fetchLocations = params=>{
  return apiCall(locationsEndpoint(params));
}