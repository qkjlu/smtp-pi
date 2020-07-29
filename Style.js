import { Dimensions} from "react-native";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 220;
const CARD_WIDTH = width * 0.8;

export default {
    container:{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerForm:{
        alignItems: 'center',
    },

    input : {
        height : 40 ,
        padding : 10,
        borderColor: 'gray',
        borderWidth:1 ,
        marginHorizontal : 5
    },
    worksite : {
        backgroundColor : '#FFFFFF',
        borderWidth: 1,
        borderBottomColor : '#202340',
        marginHorizontal : 5,
        paddingHorizontal : 20,
        paddingVertical : 10,
        flex : 1,
        flexDirection : 'row',
        justifyContent : 'space-between',
    },

    semaines : {
        backgroundColor : '#FFFFFF',
        borderWidth: 1,
        borderBottomColor : '#202340',
        marginHorizontal : 5,
        paddingHorizontal : 20,
        paddingVertical : 10,
        flex : 1,
        flexDirection : 'column',
        justifyContent : 'space-between',
    },

    jours: {
        marginVertical : 2,
        fontSize: 15,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center',
    },

    previewPlace : {
        backgroundColor : '#FFFFFF',
        borderBottomColor : '#202340',
        marginTop : 30,
        height : 37,
        flex : 1,
        flexDirection : 'row',
        justifyContent : 'space-between',
        alignItems: 'center',
    },
    rightWorksite : {
        color : '#FFF',
        fontweight : 'bold',
        fontSize : 22
    },
    button : {
        width: '40%',
        height : 40,
        paddingHorizontal : 4,
        flex :1
    },
    buttonIcon : {
        height : 50,
        paddingHorizontal : 4,
        flex : 1
    },
    littleButton : {
        width: '10%',
        height : 40
    },
    containerlist:{
        flex : 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal : 60,
        backgroundColor : 'rgba(252,164,0,0.22)'
    },
    title : {
        fontWeight: 'bold',
        fontSize: 30,
        paddingTop : 20
    },
    formInput : {
        height : 40 ,
        padding : 10,
        borderColor: 'gray',
        borderWidth:1
    },
    getStartedText: {
        marginVertical : 40,
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
    },
    textinput : {
        alignSelf: 'stretch',
        height: 40,
        color: "black",
        backgroundColor: '#ffffff',
        borderWidth : 1,
        borderColor : '#abb0b0',
        marginHorizontal : 15,
        marginBottom: 15,
    },

    // Marker Custom
    bubble : {
        flexDirection : 'column',
        alignSelf: "flex-start",
        backgroundColor : '#fff',
        borderColor: "#cccccc",
        width: 150,
    },

    arrow: {
        backgroundColor: "transparent",
        borderColor : "transparent",
        borderTopColor : "#fff",
        borderWidth: 16,
        alignSelf: 'center',
        marginTop : -32,
    },

    arrowBorder: {
        backgroundColor: "transparent",
        borderColor : "transparent",
        borderTopColor : "#007a87",
        borderWidth: 16,
        alignSelf: 'center',
        marginTop : -0.5,
    },

    name : {
        fontSize: 16,
        marginBottom: 5,
    },

    card: {
        flexDirection : "row",
        position : "absolute",
        backgroundColor: "#FFF",
        borderRadius : 5,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        bottom: 5,
        left: width*0.07,
        right: 0,
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
    },
    textContent: {
        flex: 2,
        padding: 10,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: "bold",
    },
    cardDescription: {
        fontSize: 12,
        color: "#444",
    },
}
