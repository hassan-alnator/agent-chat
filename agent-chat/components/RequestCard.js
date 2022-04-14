import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import CloseIcon from '@material-ui/icons/Close';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Avatar from '@material-ui/core/Avatar';
import Lottie from 'react-lottie';
import Button from '@material-ui/core/Button';
import alertAnimiation from '../animations/alert.json';
import acceptAnimiation from '../animations/accept.json';
const createOptions = (animation) => {
    return ({
        loop: true,
        autoplay: true,
        animationData: animation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    });
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flex: 1
    },
    details: {
        display: 'flex',
        flex: 2,
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: 151,
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    playIcon: {
        height: 38,
        width: 38,
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
    large: {
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
    avatar: {
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flex: 1
    },
    alert: {
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flex: 1
    },
    actions: {
        alignItems: "center",
        justifyContent: "center",
        display: "flex"
    },
    actionButton: {
        flex: 1
    }
}));

export default function MediaControlCard({ name, avatarUrl, status, onAccept }) {
    const classes = useStyles();
    const theme = useTheme();


    return (
        <div style={{ float: "right", width: status === "active" ? "100%" : "100%", padding: 10 }}>
            <Card className={classes.root}>
                {status === "active" && <div className={classes.alert}><Lottie options={createOptions(alertAnimiation)}
                    height={80}
                    width={80}
                    isStopped={false}
                    isPaused={false}
                /></div>}
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography component="p" variant="p">
                            Chat Request
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {name}
                        </Typography>
                    </CardContent>
                    <div className={classes.controls}>

                    </div>
                </div>
                <div className={classes.avatar}>
                    <Avatar alt={name} src={avatarUrl} className={classes.large} />
                </div>

            </Card>
            <CardActions className={classes.actions}>
                <Button onClick={onAccept} className={classes.actionButton} variant="contained" color={status === "active" ? "primary" : ""} disabled={status !== "active"}>
                    Accept
            </Button>
                <Button className={classes.actionButton} variant="contained" color={status === "active" ? "secondary" : ""} disabled={status !== "active"}>
                    Reject
            </Button>
            </CardActions>
        </div>
    );
}
