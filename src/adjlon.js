function adjlon(lon) {
  var SPI = 3.14159265359,
      TWOPI = 6.2831853071795864769,
      ONEPI = 3.14159265358979323846;

  if (fabs(lon) > SPI) {
    lon += ONEPI;  /* adjust to 0.0.2pi rad */
    lon -= TWOPI * floor(lon / TWOPI); /* remove integral # of 'revolutions'*/
    lon -= ONEPI;  /* adjust back to -pi..pi rad */
  }
  return lon;
}
