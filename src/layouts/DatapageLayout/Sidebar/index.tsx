import {useContext} from 'react'
import {Scrollbars} from 'react-custom-scrollbars-2'
import {SidebarContext} from '../../../contexts/SidebarContext'
import Logo from '../../../components/Logo'

import {Box, Button, Drawer, Hidden, Stack} from '@mui/material'

import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';
import {styled} from '@mui/material/styles'
import SidebarMenu from './SidebarMenu'

const Input = styled('input')({
    display: 'none',
  });

const SidebarWrapper = styled(Box)(
    ({theme}) => `
        width       : ${theme.sidebar.width};
        color       : ${theme.sidebar.textColor};
        background  : ${theme.sidebar.background};
        box-shadow  : ${theme.sidebar.boxShadow};
        height      : 100%;
                
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            position                    : fixed;
            z-index                     : 10;
            border-top-right-radius     : ${theme.general.borderRadius};
            border-bottom-right-radius  : ${theme.general.borderRadius};
        }
    `
)

const TopSection = styled(Box)(
    ({theme}) => `
        display        : flex;
        height         : 88px;
        align-items    : center;
        margin         : 0 ${theme.spacing(2)} ${theme.spacing(2)};
        border-bottom  : ${theme.sidebar.dividerBg} solid 1px;
    `
)

function Sidebar() {
    const {sidebarToggle, toggleSidebar} = useContext(SidebarContext)
    const closeSidebar = () => toggleSidebar()

    return (
        <> < Hidden lgDown > <SidebarWrapper>
            <Scrollbars autoHide>
                <Stack alignItems = "center">
                    <TopSection>
                        <Logo/>
                    </TopSection>
                    <Input accept="*" id="import-data" multiple type="file" />
                    <label htmlFor="import-data"> 
                        <Button sx={{width:130}}
                            startIcon={<UploadTwoToneIcon />}
                            variant="contained"
                            component="span"> 
                        Import
                        </Button>
                    </label>
                </Stack>
                <SidebarMenu/> 
                <Stack sx={{height:'70%'}} alignItems = "center" direction='column-reverse'>
                    <Button variant = "outlined" component="span"> About </Button>
                </Stack>
            </Scrollbars>
        </SidebarWrapper>
    </Hidden>
    <Hidden lgUp>
        <Drawer anchor='left' open={sidebarToggle} onClose={closeSidebar} variant='temporary' elevation={9}>
            <SidebarWrapper>
                <Scrollbars autoHide>
                    <TopSection>
                        <Logo/>
                    </TopSection>
                    <SidebarMenu/>
                </Scrollbars>
            </SidebarWrapper>
        </Drawer>
    </Hidden>
</>
    )
}

export default Sidebar
