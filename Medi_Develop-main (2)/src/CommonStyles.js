import theme from './themes';
const MainHeading = {
    fontSize:32,
    fontWeight:'bold',
    padding:30,
    color:theme.tabBar,
    paddingTop:0,
}
const OtherView = {
    flexDirection: "row",
    backgroundColor: theme.tabBar,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
}
const TextStyles = {
    padding: 15,
    alignSelf: "center",
    color: theme.white,
    flex: 0.9,
    fontSize:16
}
const IconStyles = {
    justifyContent: "center",
    alignItems: "center",
    textAlignVertical: "center",
}
const RestrictionText = {
    padding: 22,
    color: theme.tabBar,
    paddingTop: 0,
    paddingBottom:15
}
const SaveButton = {
    backgroundColor: theme.secondary,
    width: "50%",
    alignSelf: "flex-start",
    borderRadius: 20,
    marginLeft:20
}
const SaveText = {
    padding: 15,
    color: theme.white,
    fontSize:22,
    fontWeight:'bold',
    textAlign:'center',
}
const SaveButtonSmall = {
    backgroundColor: theme.secondary,
    alignSelf: "flex-start",
    borderRadius: 10,
    margin:10
}
const SaveTextSmall = {
    padding: 10,
    color: theme.white,
    fontSize:16,
    fontWeight:'bold',
    textAlign:'center',
}

const CommonStyles = {
    MainHeading,
    OtherView,
    TextStyles,
    IconStyles,
    RestrictionText,
    SaveButton,
    SaveText,
    SaveTextSmall,
    SaveButtonSmall
}

export default CommonStyles;