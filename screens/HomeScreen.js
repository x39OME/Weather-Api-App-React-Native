import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import {theme} from '../theme';
import {MagnifyingGlassIcon} from 'react-native-heroicons/outline'
import {MapPinIcon, CalendarDaysIcon} from 'react-native-heroicons/solid'
import {debounce} from 'lodash'
import {fetchLocations, fetchweatherForecast} from '../api/weather'
import {weatherImages} from '../constants/index'
import * as Progress from 'react-native-progress';
import { storeData, getData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc)=>{
    // console.log('location:', loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);

    fetchweatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
      // console.log('Got data:', data);
    })
  }

  const handleSearch = value=>{
    if(value.length>2){
      fetchLocations({cityName: value}).then(data=>{
        setLocations(data)
      })
    }
  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Jeddah';
    if (myCity) cityName = myCity;
    fetchweatherForecast({
      cityName,
      days:'7'
    }).then(data=>{
      setWeather(data)
      setLoading(false)
    })
  }
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])
  const {current, location} = weather;

  return (
    <View className='flex-1 relative'>
      <StatusBar style='light' />
      {/* Background Image */}
      <Image source={require('../assets/images/background/bg5.jpg')} blurRadius={70} className='absolute h-full w-full'/>

      {
        loading? (
          <View className='flex-1 flex-row justify-center items-center'>
            <Progress.Circle thickness={10} size={140} color='#0bb3b2' />
          </View>
        ):(
          <SafeAreaView className='flex flex-1'>
          {/* Search Bar Sec */}
          <View style={{height:'7%'}} className='mx-4 mt-2 relative z-50'>
            <View className='flex-row justify-end items-center rounded-3xl'
              style={{backgroundColor: showSearch? theme.bgWhite(.4): 'transparent'}}>
                {
                  showSearch? (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder='Search City'
                      placeholderTextColor={'lightgray'}
                      className='pl-4 h-10 flex-1 text-base text-gray-600'
                    />
                  ):null
                }

                <TouchableOpacity
                  onPress={()=> toggleSearch(!showSearch)}
                  style={{backgroundColor: theme.bgWhite(.4)}}
                  className='rounded-3xl p-2 m-1'
                >
                  {/* Icon Search */}
                  <MagnifyingGlassIcon size='25' color='white' />
                </TouchableOpacity>
              </View>
              {
                locations.length>0 && showSearch? (
                  <View className='absolute w-full bg-white top-14 rounded-3xl'>
                    {
                      locations.map((loc,index)=>{
                        let showBorder = index+1 != locations.length;
                        let borderClass = showBorder? 'border-b-2 border-b-gray-400': '';
                        return (
                          <TouchableOpacity
                            onPress={()=> handleLocation(loc)}
                            key={index}
                            className={'flex-row items-center border-0 p-3 px-4 mb-1 '+borderClass}
                          >
                            <MapPinIcon size='20' color='gray' />
                            <Text className='text-black text-base ml-2'>{loc?.name}, {loc?.country}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                ):null
              }
          </View>

          {/* Forecast Sec */}
          <View className='mx-4 flex justify-around flex-1 mb-6'>
            {/* Location */}
            <Text className='text-white text-center text-2xl font-bold'>
              {location?.name}, 
              <Text className='text-lg font-semibold text-gray-300'>
              {' '+location?.country}
              </Text>
            </Text>
            {/* Weather Image */}
            <View className='flex-row justify-center'>
              <Image className='w-44 h-44'
                source={weatherImages[current?.condition?.text]} />
                {/*source={require('../assets/images/partlycloudy.png')}*/}
            </View>
            {/* Degree Celcius*/}
            <View className='space-y-2'>
              <Text className='text-center font-bold text-white text-5xl ml-5'>
                {current?.temp_c}&#176;
              </Text>
              <Text className='text-center text-white text-xl tracking-widest'>
              {current?.condition.text}
              </Text>
            </View>
            {/* Other Stats */}
            <View className='flex-row justify-between mx-4'>
              {/* Wind */}
              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/images/wind.png')} className='h-6 w-6'/>
                <Text className='text-white font-semibold text-base'>
                  {current?.wind_kph}km
                </Text>
              </View>
              {/* Drop */}
              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/images/drop.png')} className='h-6 w-6'/>
                <Text className='text-white font-semibold text-base'>
                  {current?.humidity}%
                </Text>
              </View>
              {/* Sun */}
              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/images/icsun.png')} className='h-6 w-6'/>
                <Text className='text-white font-semibold text-base'>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          {/* Forecast For Next Days */}
          <View className='mb-2 space-y-3'>
            <View className='flex-row items-center mx-5 space-x-2'>
              {/* Icon Calendar Days*/}
              <CalendarDaysIcon size='22' color='white' />
              <Text className='text-white text-base'>Daily Forecast</Text>
            </View>
            {/* Scroll Next Days */}
            <ScrollView
              horizontal
              contentContainerStyle={{paddingHorizontal:15}}
              showsHorizontalScrollIndicator={false}>
              {
                weather?.forecast?.forecastday?.map((item, index)=>{
                  let date = new Date(item.date);
                  let options = {weekday:'long'};
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0]
                  return (
                    // Forecast next Days
                    <View key={index} className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4' style={{backgroundColor:theme.bgWhite(.4)}}>
                      <Image source={weatherImages[item?.day?.condition?.text]} className='h-11 w-11'/>
                      <Text className='text-white'>{dayName}</Text>
                      <Text className='text-white font-semibold text-xl'>{item?.day?.avgtemp_c}&#176;</Text>
                    </View>
                  )
                })
              }
            </ScrollView>
          </View>
        </SafeAreaView>
        )
      }
    </View>
  )
}