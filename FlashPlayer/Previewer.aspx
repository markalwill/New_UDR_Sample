<%@ page language="C#" masterpagefile="~/MasterPages/SWFPopupMasterPage.master" autoeventwireup="true" inherits="Previewer, App_Web_hxo42lm1" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <script type="text/javascript" src="../Includes/js/Comment.js"></script>
    <script type="text/javascript" src="../Package/BAse/Player/SCORM_API_DIF.js"></script>
    <script type="text/javascript">    DIFCommon.targetSWF = "Previewer";</script>
    <script type="text/javascript" src="../Includes/js/Preview.js"></script>
    <script type="text/javascript" src="ieFix.js"></script>  
    <script type="text/javascript" src="appFrame.js"></script>  
    <script type="text/javascript">
        <!--
        //tells the designer which type of previewer it is communicating with
        var playerType = "SWF";
        //-->
    </script>

    <div id="holder" style="border:none;">
    </div>

    <iframe id="appFrame" style="position:absolute; top:0px; left:0px; width:0px; height:0px; visibility:hidden" frameborder="0" scrolling="auto"></iframe>

    <script type="text/javascript">
        init("<%=Session.SessionID %>", "<%=unitID %>", "<%=uname %>", "<%=caller %>", "<%=previewerWidth %>", "<%=previewerHeight %>", "<%=timeout %>", "<%=webserviceURL %>", "<%=baseSWF%>");
        DIFCommon.unlockSession = false;
        document.addEventListener('onload', Preview.pageopened)
    </script>
</asp:Content>
