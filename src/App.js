import React, { useState, useEffect, useCallback } from "react";
import { StatusBar, Dimensions } from "react-native";
import styled, { ThemeProvider } from "styled-components/native";
import { theme } from "./theme";
import Input from "./components/Input";
import Task from "./components/Task";
import { Button, Alert } from "react-native";

//로컬에 데이터 관리
import AsyncStorage from "@react-native-async-storage/async-storage";

//앱실행시 로딩화면 제어 : 앱실행전 사전작업이 준비될때까지 로딩화면을 유지시키는 역할
import * as SplashScreen from "expo-splash-screen";

//사전작업이 준비될때까지 로딩화면 유지
SplashScreen.preventAutoHideAsync();

//컨테이너선언
const Container = styled.SafeAreaView.attrs(null)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: flex-start;
`;

//버킷선언
const Title = styled.Text`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  /* align-self: flex-start; */
  margin: 0 20px;
`;

//리스트 선언
//항목이 많을 경우 스크롤처리
const List = styled.ScrollView`
  flex: 1;
  width: ${({ width }) => width - 40}px;
`;

//App 출력 선언
const App = () => {
  //앱 준비상태 여부를 판단하는 상태변수
  const [appIsReady, setAppIsReady] = useState(false);

  // 새로운 작업을 저장하는 상태변수
  const [newTask, setNewTask] = useState("");

  // 작업목록을 저장하는 상태변수
  const [tasks, setTasks] = useState({});

  // 할일 항목 추가
  const h_onSubmitEditing = () => {
    // alert(newTask);
    const key = Date.now().toString(); //중복되지 않는 유일한 임의값
    const newTaskObject = {
      [key]: { id: key, text: newTask, completed: false },
    };
    setNewTask(""); //입력항목 클리어
    setTasks({ ...tasks, ...newTaskObject }); //기존 tasks에 새로 입력된 항목 추가
  };
  const { width } = Dimensions.get("window");

  //로컬파일에 저장
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks)); // js obj => json포맷의 문자열로 저장
      setTasks(tasks);
    } catch (error) {
      console.log(error.message);
    }
  };

  //로컬파일에서 읽어오기
  const loadTask = async () => {
    try {
      const loadedTasks = await AsyncStorage.getItem("tasks");
      setTasks(JSON.parse(loadedTasks || "{}")); // json포맷의 문자자열 => js obj
    } catch (error) {
      console.log(error.message);
    }
  };
  // 앱 실행전 1회 호출
  useEffect(() => {
    async function prepare() {
      try {
        // 앱 실행전 자원 준비 : 로컬파일의 항목리스트를 읽어와서 task상태 변수에 저장
        await loadTask();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true); // 앱이 준비 상태가 됨을 표시
        await SplashScreen.hideAsync(); // SplashScreen을 숨기기
      }
    }

    prepare();
  }, []);

  // 앱이 마운트될때 또는 컨테이너 레이아웃이 재계산될때마다 수행
  const onLayoutRootView = useCallback(() => {
    // 이제 이 함수는 필요하지 않으므로 비워둘 수 있습니다.
  }, []);

  // 앱이 준비상태가 되었을때만 이하로직 수행
  if (!appIsReady) return null;
  const h_onChangeText = (text) => setNewTask(text);

  // 할일 항목 수정
  const h_updateTask = (task) => {
    const currentTasks = { ...tasks };
    currentTasks[task.id] = task;
    setTasks(currentTasks);
  };

  // 할일 항목 완료 체크
  const h_toggleTask = (id) => {
    const currentTasks = { ...tasks };
    currentTasks[id]["completed"] = !currentTasks[id]["completed"];
    setTasks(currentTasks);
  };

  // 할일 항목 등록취소
  const h_onBlur = () => {
    setNewTask("");
  };

  // 할일 항목 삭제
  const h_deleteTask = (id) => {
    Alert.alert(
      "알림",
      "이 항목을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "확인",
          onPress: () => {
            const currentTasks = { ...tasks };
            delete currentTasks[id];
            setTasks(currentTasks);
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 완료항목삭제 버튼
  // 완료 항목 배열만들기
  const deleteCompletedTasks = () => {
    const completedTaskIds = Object.keys(tasks).filter(
      (taskId) => tasks[taskId].completed === true
    );

    if (completedTaskIds.length === 0) {
      // 삭제할 완료 항목이 없는 경우
      Alert.alert("알림", "삭제할 완료 항목이 없습니다.", [{ text: "확인" }]);
    } else {
      // 확인 알람 모달을 띄우고, 확인 버튼을 누르면 항목을 삭제
      Alert.alert(
        "알림",
        "완료된 항목을 삭제하시겠습니까?",
        [
          {
            text: "취소",
            style: "cancel", // 취소 버튼 스타일
          },
          {
            text: "확인",
            onPress: () => {
              const currentTasks = { ...tasks };
              completedTaskIds.forEach((taskId) => {
                delete currentTasks[taskId];
              });
              setTasks(currentTasks);
            },
          },
        ],
        { cancelable: false } // 뒤로가기 버튼으로 모달 닫기 금지
      );
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Container>
        <Title>Bucket List</Title>
        <Input
          placeholder=" + 항목추가 "
          value={newTask}
          onChangeText={h_onChangeText}
          onSubmitEditing={h_onSubmitEditing}
          onBlur={h_onBlur} // 항목추가 입력필드가 포커스 벗어나면 호출
        />
        <List width={width}>
          {Object.values(tasks)
            .reverse()
            .map((task) => (
              <Task
                key={task.id}
                task={task}
                updateTask={h_updateTask} // 수정
                toggleTask={h_toggleTask} // 완료 체크
                deleteTask={h_deleteTask} // 삭제
              />
            ))}
        </List>
        <Button title="완료항목 삭제" onPress={deleteCompletedTasks} />
      </Container>
    </ThemeProvider>
  );
};

export default App;
