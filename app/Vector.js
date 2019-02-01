class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  mul(s) {
    this.x *= s;
    this.y *= s;

    return this;
  }

  div(s) {
    !s && console.error('Division by zero!');

    this.x /= s;
    this.y /= s;

    return this;
  }

  // Magnitude
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.mag();
    mag && this.div(mag);
    return this;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  setMag(m) {
    const angle = this.angle();
    this.x = m * Math.cos(angle);
    this.y = m * Math.sin(angle);
    return this;
  }

  setAngle(a) {
    const mag = this.mag();
    this.x = mag * Math.cos(a);
    this.y = mag * Math.sin(a);
    return this;
  }

  rotate(a) {
    this.setAngle(this.angle() + a);
    return this;
  }

  limit(l) {
    const mag = this.mag();
    if (mag > l) this.setMag(l);
    return this;
  }

  angleBetween(v) {
    return this.angle() - v.angle();
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  lerp(v, amt) {
    this.x += (v.x - this.x) * amt;
    this.y += (v.y - this.y) * amt;
    return this;
  }

  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  random() {
    this.set(1, 1);
    this.setAngle(Math.random() * Math.PI * 2);
    return this;
  }
}

export default Vector;
