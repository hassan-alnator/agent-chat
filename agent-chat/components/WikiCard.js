import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
   
    marginBottom: 5
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 10,
    margin:0
  },
  pos: {
    marginBottom: 10,
  },
});

export default function SimpleCard({text}) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Card className={classes.root}>
      <CardContent style={{paddingBottom: 0}}>
       
         <pre className={classes.title}> {text}</pre>
       
       
      </CardContent>
      <CardActions>
        <Button size="small">Use Script</Button>
      </CardActions>
    </Card>
  );
}
